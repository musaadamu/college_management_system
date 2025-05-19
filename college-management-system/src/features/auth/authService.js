import axios from 'axios';
import mockAuthService from '../../services/mockAuthService';

// API URL
const API_URL = 'http://localhost:5000/api/auth/';

// Use mock service flag
const USE_MOCK_SERVICE = true; // Set to false when backend is available

// Register user
const register = async (userData) => {
  try {
    if (USE_MOCK_SERVICE) {
      return await mockAuthService.register(userData);
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
    return await mockAuthService.register(userData);
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

const authService = {
  register,
  login,
  logout,
};

export default authService;
