import axios from 'axios';
import mockAuthService from './mockAuthService';

const API_URL = 'http://localhost:5000/api/auth/';

// Use mock service flag
const USE_MOCK_SERVICE = true; // Set to false when backend is available

// Register user
const register = async (userData) => {
  try {
    if (USE_MOCK_SERVICE) {
      const response = await mockAuthService.register(userData);
      localStorage.setItem('user', JSON.stringify(response));
      return response;
    }

    const response = await axios.post(API_URL + 'register', userData);

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    if (USE_MOCK_SERVICE) {
      throw error;
    }

    // If backend is not available, fallback to mock service
    console.warn('Backend not available, using mock service');
    const response = await mockAuthService.register(userData);
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  }
};

// Login user
const login = async (userData) => {
  try {
    if (USE_MOCK_SERVICE) {
      const response = await mockAuthService.login(userData);
      localStorage.setItem('user', JSON.stringify(response));
      return response;
    }

    const response = await axios.post(API_URL + 'login', userData);

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    if (USE_MOCK_SERVICE) {
      throw error;
    }

    // If backend is not available, fallback to mock service
    console.warn('Backend not available, using mock service');
    const response = await mockAuthService.login(userData);
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');

  if (USE_MOCK_SERVICE) {
    mockAuthService.logout();
  }
};

// Get current user
const getCurrentUser = async (token) => {
  try {
    if (USE_MOCK_SERVICE) {
      // In mock mode, just return the user from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.user || null;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL + 'me', config);
    return response.data;
  } catch (error) {
    if (USE_MOCK_SERVICE) {
      throw error;
    }

    // If backend is not available, fallback to mock service
    console.warn('Backend not available, using mock service');
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.user || null;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
