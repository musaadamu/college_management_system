const express = require('express');
const { 
  getAttendances, 
  getStudentAttendance, 
  getCourseAttendance, 
  createAttendance, 
  updateAttendance, 
  deleteAttendance 
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for admin and faculty
router.route('/')
  .get(authorize('admin', 'faculty'), getAttendances)
  .post(authorize('admin', 'faculty'), createAttendance);

// Routes for specific student attendance
router.get('/student/:studentId', getStudentAttendance);

// Routes for specific course attendance
router.get('/course/:courseId', authorize('admin', 'faculty'), getCourseAttendance);

// Routes for specific attendance record
router.route('/:id')
  .put(authorize('admin', 'faculty'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

module.exports = router;
