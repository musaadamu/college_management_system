import axios from 'axios';

const API_URL = 'http://localhost:5000/api/assignments/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all assignments
const getAllAssignments = async (filters = {}, token) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.course) {
    queryParams.append('course', filters.course);
  }
  
  if (filters.status) {
    queryParams.append('status', filters.status);
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

// Get assignment by ID
const getAssignmentById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + id, config);
  return response.data;
};

// Create new assignment
const createAssignment = async (assignmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, assignmentData, config);
  return response.data;
};

// Update assignment
const updateAssignment = async (id, assignmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, assignmentData, config);
  return response.data;
};

// Delete assignment
const deleteAssignment = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

// Submit assignment
const submitAssignment = async (id, submissionData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + id + '/submit', submissionData, config);
  return response.data;
};

// Grade submission
const gradeSubmission = async (assignmentId, studentId, gradeData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    API_URL + assignmentId + '/grade/' + studentId,
    gradeData,
    config
  );
  return response.data;
};

const assignmentService = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getToken,
};

export default assignmentService;
