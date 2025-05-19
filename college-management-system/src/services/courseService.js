import axios from 'axios';

const API_URL = 'http://localhost:5000/api/courses/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all courses
const getAllCourses = async (filters = {}, token = null) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.title) {
    queryParams.append('title', filters.title);
  }
  
  if (filters.code) {
    queryParams.append('code', filters.code);
  }
  
  if (filters.department) {
    queryParams.append('department', filters.department);
  }
  
  if (filters.semester) {
    queryParams.append('semester', filters.semester);
  }
  
  if (filters.year) {
    queryParams.append('year', filters.year);
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

// Get course by ID
const getCourseById = async (id, token = null) => {
  const config = token ? {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } : {};

  const response = await axios.get(API_URL + id, config);
  return response.data;
};

// Create new course
const createCourse = async (courseData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, courseData, config);
  return response.data;
};

// Update course
const updateCourse = async (id, courseData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, courseData, config);
  return response.data;
};

// Delete course
const deleteCourse = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const courseService = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getToken,
};

export default courseService;
