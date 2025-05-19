import store, { replaceReducers } from '../store';

// Import reducers
import authReducer from '../features/auth/authSlice';
import departmentReducer from '../features/departments/departmentSlice';
import courseReducer from '../features/courses/courseSlice';
import enrollmentReducer from '../features/enrollments/enrollmentSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import userReducer from '../features/users/userSlice';
import calendarReducer from '../features/calendar/calendarSlice';
import fileReducer from '../features/files/fileSlice';
import assignmentReducer from '../features/assignments/assignmentSlice';
import notificationReducer from '../features/notifications/notificationSlice';

// Register reducers
store.asyncReducers = {
  auth: authReducer,
  departments: departmentReducer,
  courses: courseReducer,
  enrollments: enrollmentReducer,
  attendance: attendanceReducer,
  users: userReducer,
  calendar: calendarReducer,
  files: fileReducer,
  assignments: assignmentReducer,
  notifications: notificationReducer,
};

// Load additional reducers asynchronously
const loadAdditionalReducers = async () => {
  try {
    // Try to load message reducer
    try {
      const messageModule = await import('../features/messages/messageSlice');
      store.asyncReducers.messages = messageModule.default;
    } catch (error) {
      console.error('Error loading message reducer:', error);
    }

    // Try to load call reducer
    try {
      const callModule = await import('../features/calls/callSlice');
      store.asyncReducers.calls = callModule.default;
    } catch (error) {
      console.error('Error loading call reducer:', error);
    }

    // Try to load key reducer
    try {
      const keyModule = await import('../features/keys/keySlice');
      store.asyncReducers.keys = keyModule.default;
    } catch (error) {
      console.error('Error loading key reducer:', error);
    }

    // Apply all reducers
    replaceReducers();
  } catch (error) {
    console.error('Error loading additional reducers:', error);
  }
};

// Load additional reducers
loadAdditionalReducers();

// Export the store

export { store };
export default store;
