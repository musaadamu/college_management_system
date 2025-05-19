const express = require('express');
const { 
  getEnrollments, 
  getEnrollment, 
  createEnrollment, 
  updateEnrollment, 
  deleteEnrollment 
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin and faculty can get all enrollments
router.get('/', authorize('admin', 'faculty'), getEnrollments);

// All authenticated users can get their own enrollments
router.get('/:id', getEnrollment);

// Students can create their own enrollments, admin can create any
router.post('/', createEnrollment);

// Students can update their own enrollments (drop), faculty can update grades, admin can do anything
router.put('/:id', updateEnrollment);

// Only admin can delete enrollments
router.delete('/:id', authorize('admin'), deleteEnrollment);

module.exports = router;
