const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
} = require('../controllers/assignmentController');

// Routes
router.route('/')
  .get(protect, getAssignments)
  .post(protect, createAssignment);

router.route('/:id')
  .get(protect, getAssignment)
  .put(protect, updateAssignment)
  .delete(protect, deleteAssignment);

router.route('/:id/submit')
  .post(protect, submitAssignment);

router.route('/:id/grade/:studentId')
  .put(protect, gradeSubmission);

module.exports = router;
