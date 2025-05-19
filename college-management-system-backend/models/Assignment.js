const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assignment title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an assignment description'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
      min: [0, 'Points cannot be negative'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who created the assignment is required'],
    },
    files: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
    }],
    submissions: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student is required'],
      },
      files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      }],
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      grade: {
        type: Number,
        min: [0, 'Grade cannot be negative'],
      },
      feedback: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ['submitted', 'graded', 'late', 'missing'],
        default: 'submitted',
      },
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);
