const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'dropped', 'completed'],
    default: 'active'
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F', 'I', 'W', ''],
    default: ''
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4
  },
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer'],
    required: [true, 'Semester is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a student can only enroll in a course once per semester/year
enrollmentSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
