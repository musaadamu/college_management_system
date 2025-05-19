import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all users
const getAllUsers = async (filters = {}, token) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.name) {
    queryParams.append('name', filters.name);
  }
  
  if (filters.email) {
    queryParams.append('email', filters.email);
  }
  
  if (filters.role) {
    queryParams.append('role', filters.role);
  }
  
  if (filters.studentId) {
    queryParams.append('studentId', filters.studentId);
  }
  
  if (filters.facultyId) {
    queryParams.append('facultyId', filters.facultyId);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}?${queryString}` : API_URL;
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(url, config);
  return response.data;
};

// Get user by ID
const getUserById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + id, config);
  return response.data;
};

// Create new user
const createUser = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, userData, config);
  return response.data;
};

// Update user
const updateUser = async (id, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, userData, config);
  return response.data;
};

// Delete user
const deleteUser = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getToken,
};

export default userService;
