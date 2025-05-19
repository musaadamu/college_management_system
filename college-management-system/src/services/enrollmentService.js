import axios from 'axios';

const API_URL = 'http://localhost:5000/api/enrollments/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all enrollments
const getAllEnrollments = async (filters = {}, token) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.student) {
    queryParams.append('student', filters.student);
  }
  
  if (filters.course) {
    queryParams.append('course', filters.course);
  }
  
  if (filters.status) {
    queryParams.append('status', filters.status);
  }
  
  if (filters.semester) {
    queryParams.append('semester', filters.semester);
  }
  
  if (filters.year) {
    queryParams.append('year', filters.year);
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

// Get enrollment by ID
const getEnrollmentById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + id, config);
  return response.data;
};

// Create new enrollment
const createEnrollment = async (enrollmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, enrollmentData, config);
  return response.data;
};

// Update enrollment
const updateEnrollment = async (id, enrollmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, enrollmentData, config);
  return response.data;
};

// Delete enrollment
const deleteEnrollment = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const enrollmentService = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getToken,
};

export default enrollmentService;
