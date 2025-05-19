import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import keyService from '../../services/keyService';
import { generateKeyPair, storeKeys, retrieveKeys } from '../../utils/cryptoUtils';

const initialState = {
  publicKey: null,
  secretKey: null,
  sharedKeys: {},
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Generate key pair
export const generateKeys = createAsyncThunk(
  'keys/generate',
  async (_, thunkAPI) => {
    try {
      const { user } = thunkAPI.getState().auth;
      
      if (!user) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }
      
      // Check if keys already exist in localStorage
      const existingKeys = retrieveKeys(user.user.id);
      
      if (existingKeys) {
        return existingKeys;
      }
      
      // Generate new key pair
      const keyPair = generateKeyPair();
      
      // Store keys in localStorage
      storeKeys(user.user.id, keyPair);
      
      // Update public key on server
      const token = keyService.getToken(thunkAPI.getState());
      await keyService.updatePublicKey(keyPair.publicKey, token);
      
      return keyPair;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get public key
export const getPublicKey = createAsyncThunk(
  'keys/getPublicKey',
  async (userId, thunkAPI) => {
    try {
      const token = keyService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }
      
      return await keyService.getPublicKey(userId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Store shared key
export const storeSharedKey = createAsyncThunk(
  'keys/storeSharedKey',
  async ({ conversationId, encryptedKey }, thunkAPI) => {
    try {
      const token = keyService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }
      
      return await keyService.storeSharedKey(conversationId, encryptedKey, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get shared key
export const getSharedKey = createAsyncThunk(
  'keys/getSharedKey',
  async (conversationId, thunkAPI) => {
    try {
      const token = keyService.getToken(thunkAPI.getState());
      
      if (!token) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }
      
      const response = await keyService.getSharedKey(conversationId, token);
      
      return {
        conversationId,
        ...response.data,
      };
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const keySlice = createSlice({
  name: 'keys',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setSharedKey: (state, action) => {
      const { conversationId, sharedKey } = action.payload;
      state.sharedKeys[conversationId] = sharedKey;
    },
    clearKeys: (state) => {
      state.publicKey = null;
      state.secretKey = null;
      state.sharedKeys = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate keys
      .addCase(generateKeys.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateKeys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.publicKey = action.payload.publicKey;
        state.secretKey = action.payload.secretKey;
      })
      .addCase(generateKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get public key
      .addCase(getPublicKey.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPublicKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(getPublicKey.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Store shared key
      .addCase(storeSharedKey.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(storeSharedKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(storeSharedKey.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get shared key
      .addCase(getSharedKey.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSharedKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Store encrypted key in state
        if (action.payload.encryptedKey) {
          state.sharedKeys[action.payload.conversationId] = {
            encryptedKey: action.payload.encryptedKey,
            isEncrypted: action.payload.isEncrypted,
          };
        }
      })
      .addCase(getSharedKey.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setSharedKey, clearKeys } = keySlice.actions;
export default keySlice.reducer;
