import axios from 'axios';

const API_URL = 'http://localhost:5000/api/files/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all files
const getAllFiles = async (filters = {}, token) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.course) {
    queryParams.append('course', filters.course);
  }
  
  if (filters.assignment) {
    queryParams.append('assignment', filters.assignment);
  }
  
  if (filters.fileType) {
    queryParams.append('fileType', filters.fileType);
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

// Get file by ID
const getFileById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + id, config);
  return response.data;
};

// Upload file
const uploadFile = async (fileData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.post(API_URL, fileData, config);
  return response.data;
};

// Delete file
const deleteFile = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

// Download file
const getDownloadUrl = (id) => {
  return `${API_URL}${id}/download`;
};

const fileService = {
  getAllFiles,
  getFileById,
  uploadFile,
  deleteFile,
  getDownloadUrl,
  getToken,
};

export default fileService;
