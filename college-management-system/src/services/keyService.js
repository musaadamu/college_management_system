import axios from 'axios';

const API_URL = '/api/keys/';

// Update public key
const updatePublicKey = async (publicKey, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + 'public', { publicKey }, config);
  return response.data;
};

// Get public key
const getPublicKey = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'public/' + userId, config);
  return response.data;
};

// Store shared key
const storeSharedKey = async (conversationId, encryptedKey, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    API_URL + 'shared/' + conversationId,
    { encryptedKey },
    config
  );
  return response.data;
};

// Get shared key
const getSharedKey = async (conversationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'shared/' + conversationId, config);
  return response.data;
};

// Get token from state
const getToken = (state) => {
  return state.auth.user?.token;
};

const keyService = {
  updatePublicKey,
  getPublicKey,
  storeSharedKey,
  getSharedKey,
  getToken,
};

export default keyService;
