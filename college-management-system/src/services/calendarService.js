import axios from 'axios';

const API_URL = 'http://localhost:5000/api/calendar/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all academic dates
const getAllAcademicDates = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Create new academic date
const createAcademicDate = async (dateData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, dateData, config);
  return response.data;
};

// Update academic date
const updateAcademicDate = async (id, dateData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, dateData, config);
  return response.data;
};

// Delete academic date
const deleteAcademicDate = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const calendarService = {
  getAllAcademicDates,
  createAcademicDate,
  updateAcademicDate,
  deleteAcademicDate,
  getToken,
};

export default calendarService;
