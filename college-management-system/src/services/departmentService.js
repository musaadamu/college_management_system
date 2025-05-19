import axios from 'axios';

const API_URL = 'http://localhost:5000/api/departments/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all departments
const getAllDepartments = async (filters = {}, token = null) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.name) {
    queryParams.append('name', filters.name);
  }
  
  if (filters.code) {
    queryParams.append('code', filters.code);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}?${queryString}` : API_URL;
  
  const config = token ? {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } : {};

  const response = await axios.get(url, config);
  return response.data;
};

// Get department by ID
const getDepartmentById = async (id, token = null) => {
  const config = token ? {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } : {};

  const response = await axios.get(API_URL + id, config);
  return response.data;
};

// Create new department
const createDepartment = async (departmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, departmentData, config);
  return response.data;
};

// Update department
const updateDepartment = async (id, departmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, departmentData, config);
  return response.data;
};

// Delete department
const deleteDepartment = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const departmentService = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getToken,
};

export default departmentService;
