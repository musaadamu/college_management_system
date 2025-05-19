// Import store dynamically to avoid circular dependencies
let storeModule = null;

// Get store synchronously
const getStoreSync = () => {
  if (!storeModule) {
    // If store is not loaded yet, return a placeholder
    return {
      getState: () => ({
        auth: { user: null },
        keys: { sharedKeys: {} }
      }),
      dispatch: () => {}
    };
  }
  return storeModule;
};
import {
  generateSharedKey,
  encryptMessage,
  decryptMessage,
  encryptSharedKey,
  decryptSharedKey,
  storeSharedKey as storeSharedKeyLocal,
  retrieveSharedKey as retrieveSharedKeyLocal
} from '../utils/cryptoUtils';

// Import actions from keySlice dynamically to avoid circular dependencies
let keySliceActions = null;
const getKeySliceActions = async () => {
  if (!keySliceActions) {
    const module = await import('../features/keys/keySlice');
    keySliceActions = {
      getPublicKey: module.getPublicKey,
      storeSharedKey: module.storeSharedKey,
      getSharedKey: module.getSharedKey,
      setSharedKey: module.setSharedKey
    };
  }
  return keySliceActions;
};

// Initialize encryption for a conversation
export const initializeEncryption = async (conversationId, participants) => {
  try {
    const store = getStoreSync();
    const state = store.getState();
    const { user } = state.auth;
    const { secretKey } = state.keys;

    // Get key slice actions
    const actions = await getKeySliceActions();

    // Check if we already have a shared key for this conversation
    const existingSharedKey = retrieveSharedKeyLocal(conversationId);
    if (existingSharedKey) {
      // Store in Redux
      getStoreSync().dispatch(actions.setSharedKey({
        conversationId,
        sharedKey: existingSharedKey
      }));
      return true;
    }

    // Try to get shared key from server
    const result = await getStoreSync().dispatch(actions.getSharedKey(conversationId)).unwrap();

    if (result.encryptedKey) {
      // We need to decrypt the shared key
      const encryptedKey = result.encryptedKey;

      // Get the sender's public key (assuming the first participant who isn't the current user)
      const otherParticipantId = participants.find(p => p !== user.user.id);

      if (!otherParticipantId) {
        throw new Error('No other participant found');
      }

      // Get the other participant's public key
      const publicKeyResult = await getStoreSync().dispatch(actions.getPublicKey(otherParticipantId)).unwrap();
      const otherPublicKey = publicKeyResult.data.publicKey;

      if (!otherPublicKey) {
        throw new Error('Could not get other participant\'s public key');
      }

      // Decrypt the shared key
      const sharedKey = decryptSharedKey(encryptedKey, otherPublicKey, secretKey);

      if (!sharedKey) {
        throw new Error('Could not decrypt shared key');
      }

      // Store the shared key locally
      storeSharedKeyLocal(conversationId, sharedKey);

      // Store in Redux
      getStoreSync().dispatch(actions.setSharedKey({
        conversationId,
        sharedKey
      }));

      return true;
    } else {
      // We need to create a new shared key
      const sharedKey = generateSharedKey();

      // Store the shared key locally
      storeSharedKeyLocal(conversationId, sharedKey);

      // Store in Redux
      getStoreSync().dispatch(actions.setSharedKey({
        conversationId,
        sharedKey
      }));

      // For each participant, encrypt the shared key with their public key
      for (const participantId of participants) {
        if (participantId === user.user.id) {
          continue; // Skip current user
        }

        // Get the participant's public key
        const publicKeyResult = await getStoreSync().dispatch(actions.getPublicKey(participantId)).unwrap();
        const participantPublicKey = publicKeyResult.data.publicKey;

        if (!participantPublicKey) {
          console.error(`Could not get public key for participant ${participantId}`);
          continue;
        }

        // Encrypt the shared key with the participant's public key
        const encryptedKey = encryptSharedKey(sharedKey, participantPublicKey, secretKey);

        if (!encryptedKey) {
          console.error(`Could not encrypt shared key for participant ${participantId}`);
          continue;
        }

        // Store the encrypted key on the server
        await getStoreSync().dispatch(actions.storeSharedKey({
          conversationId,
          encryptedKey
        })).unwrap();
      }

      return true;
    }
  } catch (error) {
    console.error('Error initializing encryption:', error);
    return false;
  }
};

// Encrypt a message
export const encryptMessageContent = (message, conversationId) => {
  try {
    const state = getStoreSync().getState();
    const sharedKey = state.keys.sharedKeys[conversationId]?.sharedKey ||
                      retrieveSharedKeyLocal(conversationId);

    if (!sharedKey) {
      console.error('No shared key found for conversation');
      return message;
    }

    return encryptMessage(message, sharedKey);
  } catch (error) {
    console.error('Error encrypting message:', error);
    return message;
  }
};

// Decrypt a message
export const decryptMessageContent = (encryptedMessage, conversationId) => {
  try {
    const state = getStoreSync().getState();
    const sharedKey = state.keys.sharedKeys[conversationId]?.sharedKey ||
                      retrieveSharedKeyLocal(conversationId);

    if (!sharedKey) {
      console.error('No shared key found for conversation');
      return encryptedMessage;
    }

    const decryptedMessage = decryptMessage(encryptedMessage, sharedKey);
    return decryptedMessage || encryptedMessage;
  } catch (error) {
    console.error('Error decrypting message:', error);
    return encryptedMessage;
  }
};
