import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// Generate a new key pair
export const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair();
  
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
};

// Generate a shared key for a conversation
export const generateSharedKey = () => {
  // Generate a random 32-byte key
  const sharedKey = nacl.randomBytes(nacl.secretbox.keyLength);
  return naclUtil.encodeBase64(sharedKey);
};

// Encrypt a message using a shared key
export const encryptMessage = (message, sharedKeyBase64) => {
  try {
    // Convert message to Uint8Array
    const messageUint8 = naclUtil.decodeUTF8(message);
    
    // Convert shared key from base64 to Uint8Array
    const sharedKeyUint8 = naclUtil.decodeBase64(sharedKeyBase64);
    
    // Generate a random nonce
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    
    // Encrypt the message
    const encryptedMessage = nacl.secretbox(messageUint8, nonce, sharedKeyUint8);
    
    // Combine nonce and encrypted message
    const fullMessage = new Uint8Array(nonce.length + encryptedMessage.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedMessage, nonce.length);
    
    // Return as base64 string
    return naclUtil.encodeBase64(fullMessage);
  } catch (error) {
    console.error('Error encrypting message:', error);
    return null;
  }
};

// Decrypt a message using a shared key
export const decryptMessage = (encryptedMessageBase64, sharedKeyBase64) => {
  try {
    // Convert encrypted message from base64 to Uint8Array
    const encryptedMessageUint8 = naclUtil.decodeBase64(encryptedMessageBase64);
    
    // Convert shared key from base64 to Uint8Array
    const sharedKeyUint8 = naclUtil.decodeBase64(sharedKeyBase64);
    
    // Extract nonce and encrypted message
    const nonce = encryptedMessageUint8.slice(0, nacl.secretbox.nonceLength);
    const encryptedMessage = encryptedMessageUint8.slice(nacl.secretbox.nonceLength);
    
    // Decrypt the message
    const decryptedMessage = nacl.secretbox.open(encryptedMessage, nonce, sharedKeyUint8);
    
    if (!decryptedMessage) {
      throw new Error('Failed to decrypt message');
    }
    
    // Convert decrypted message to string
    return naclUtil.encodeUTF8(decryptedMessage);
  } catch (error) {
    console.error('Error decrypting message:', error);
    return null;
  }
};

// Encrypt a shared key using a public key
export const encryptSharedKey = (sharedKeyBase64, publicKeyBase64, senderSecretKeyBase64) => {
  try {
    // Convert shared key from base64 to Uint8Array
    const sharedKeyUint8 = naclUtil.decodeBase64(sharedKeyBase64);
    
    // Convert public key from base64 to Uint8Array
    const publicKeyUint8 = naclUtil.decodeBase64(publicKeyBase64);
    
    // Convert sender's secret key from base64 to Uint8Array
    const senderSecretKeyUint8 = naclUtil.decodeBase64(senderSecretKeyBase64);
    
    // Generate a random nonce
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    
    // Encrypt the shared key
    const encryptedSharedKey = nacl.box(
      sharedKeyUint8,
      nonce,
      publicKeyUint8,
      senderSecretKeyUint8
    );
    
    // Combine nonce and encrypted shared key
    const fullMessage = new Uint8Array(nonce.length + encryptedSharedKey.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedSharedKey, nonce.length);
    
    // Return as base64 string
    return naclUtil.encodeBase64(fullMessage);
  } catch (error) {
    console.error('Error encrypting shared key:', error);
    return null;
  }
};

// Decrypt a shared key using a secret key
export const decryptSharedKey = (encryptedSharedKeyBase64, senderPublicKeyBase64, secretKeyBase64) => {
  try {
    // Convert encrypted shared key from base64 to Uint8Array
    const encryptedSharedKeyUint8 = naclUtil.decodeBase64(encryptedSharedKeyBase64);
    
    // Convert sender's public key from base64 to Uint8Array
    const senderPublicKeyUint8 = naclUtil.decodeBase64(senderPublicKeyBase64);
    
    // Convert secret key from base64 to Uint8Array
    const secretKeyUint8 = naclUtil.decodeBase64(secretKeyBase64);
    
    // Extract nonce and encrypted shared key
    const nonce = encryptedSharedKeyUint8.slice(0, nacl.box.nonceLength);
    const encryptedSharedKey = encryptedSharedKeyUint8.slice(nacl.box.nonceLength);
    
    // Decrypt the shared key
    const decryptedSharedKey = nacl.box.open(
      encryptedSharedKey,
      nonce,
      senderPublicKeyUint8,
      secretKeyUint8
    );
    
    if (!decryptedSharedKey) {
      throw new Error('Failed to decrypt shared key');
    }
    
    // Return as base64 string
    return naclUtil.encodeBase64(decryptedSharedKey);
  } catch (error) {
    console.error('Error decrypting shared key:', error);
    return null;
  }
};

// Store keys securely in localStorage
export const storeKeys = (userId, keyPair) => {
  try {
    const keysJson = JSON.stringify(keyPair);
    localStorage.setItem(`crypto_keys_${userId}`, keysJson);
    return true;
  } catch (error) {
    console.error('Error storing keys:', error);
    return false;
  }
};

// Retrieve keys from localStorage
export const retrieveKeys = (userId) => {
  try {
    const keysJson = localStorage.getItem(`crypto_keys_${userId}`);
    if (!keysJson) return null;
    return JSON.parse(keysJson);
  } catch (error) {
    console.error('Error retrieving keys:', error);
    return null;
  }
};

// Store a shared key for a conversation
export const storeSharedKey = (conversationId, sharedKey) => {
  try {
    localStorage.setItem(`shared_key_${conversationId}`, sharedKey);
    return true;
  } catch (error) {
    console.error('Error storing shared key:', error);
    return false;
  }
};

// Retrieve a shared key for a conversation
export const retrieveSharedKey = (conversationId) => {
  try {
    return localStorage.getItem(`shared_key_${conversationId}`);
  } catch (error) {
    console.error('Error retrieving shared key:', error);
    return null;
  }
};
