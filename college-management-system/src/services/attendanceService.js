import axios from 'axios';

const API_URL = 'http://localhost:5000/api/attendance/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all attendance records
const getAllAttendances = async (filters = {}, token) => {
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
  
  if (filters.date) {
    queryParams.append('date', filters.date);
  }
  
  if (filters.startDate) {
    queryParams.append('startDate', filters.startDate);
  }
  
  if (filters.endDate) {
    queryParams.append('endDate', filters.endDate);
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

// Get attendance records for a specific student
const getStudentAttendance = async (studentId, filters = {}, token) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.course) {
    queryParams.append('course', filters.course);
  }
  
  if (filters.status) {
    queryParams.append('status', filters.status);
  }
  
  if (filters.date) {
    queryParams.append('date', filters.date);
  }
  
  if (filters.startDate) {
    queryParams.append('startDate', filters.startDate);
  }
  
  if (filters.endDate) {
    queryParams.append('endDate', filters.endDate);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}student/${studentId}?${queryString}` : `${API_URL}student/${studentId}`;
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(url, config);
  return response.data;
};

// Get attendance records for a specific course
const getCourseAttendance = async (courseId, filters = {}, token) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  
  if (filters.student) {
    queryParams.append('student', filters.student);
  }
  
  if (filters.status) {
    queryParams.append('status', filters.status);
  }
  
  if (filters.date) {
    queryParams.append('date', filters.date);
  }
  
  if (filters.startDate) {
    queryParams.append('startDate', filters.startDate);
  }
  
  if (filters.endDate) {
    queryParams.append('endDate', filters.endDate);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}course/${courseId}?${queryString}` : `${API_URL}course/${courseId}`;
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(url, config);
  return response.data;
};

// Create new attendance record
const createAttendance = async (attendanceData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, attendanceData, config);
  return response.data;
};

// Update attendance record
const updateAttendance = async (id, attendanceData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, attendanceData, config);
  return response.data;
};

// Delete attendance record
const deleteAttendance = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

// Bulk create attendance records
const bulkCreateAttendance = async (attendanceDataArray, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Create an array of promises for each attendance record
  const promises = attendanceDataArray.map(data => 
    axios.post(API_URL, data, config)
  );

  // Execute all promises in parallel
  const responses = await Promise.all(promises);
  
  // Extract data from responses
  return responses.map(response => response.data);
};

const attendanceService = {
  getAllAttendances,
  getStudentAttendance,
  getCourseAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getToken,
};

export default attendanceService;
