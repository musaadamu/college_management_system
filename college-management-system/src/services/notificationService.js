import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications/';

// Get token from state
const getToken = (state) => {
  return state?.auth?.user?.token;
};

// Get all notifications
const getAllNotifications = async (params = {}, token) => {
  // Build query string from params
  const queryParams = new URLSearchParams();
  
  if (params.page) {
    queryParams.append('page', params.page);
  }
  
  if (params.limit) {
    queryParams.append('limit', params.limit);
  }
  
  if (params.read !== undefined) {
    queryParams.append('read', params.read);
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

// Get unread notification count
const getUnreadCount = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'unread-count', config);
  return response.data;
};

// Mark notification as read
const markAsRead = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id + '/read', {}, config);
  return response.data;
};

// Mark all notifications as read
const markAllAsRead = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + 'mark-all-read', {}, config);
  return response.data;
};

// Delete notification
const deleteNotification = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const notificationService = {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getToken,
};

export default notificationService;
