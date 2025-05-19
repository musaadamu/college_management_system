const { Assignment, Course, User, Enrollment, File, Notification } = require('../models');
const { createNotificationUtil } = require('./notificationController');
const { validateAssignment, validateSubmission } = require('../validations/assignmentValidation');
const apiResponse = require('../utils/apiResponse');
const fs = require('fs');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res, next) => {
  try {
    // Build query
    let query = {};

    // Filter by course if provided
    if (req.query.course) {
      query.course = req.query.course;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by user role
    if (req.user.role === 'student') {
      // Students can only see published assignments for courses they're enrolled in
      query.status = 'published';

      // Get courses the student is enrolled in
      const enrollments = await Enrollment.find({
        student: req.user.id,
        status: 'active'
      }).select('course');

      const enrolledCourseIds = enrollments.map(enrollment => enrollment.course);

      if (enrolledCourseIds.length === 0) {
        const { statusCode, response } = apiResponse.success(
          'No assignments found',
          {
            count: 0,
            assignments: []
          }
        );
        return res.status(statusCode).json(response);
      }

      // Filter by enrolled courses
      if (query.course) {
        // If specific course is requested, check if student is enrolled
        if (!enrolledCourseIds.includes(query.course)) {
          const { statusCode, response } = apiResponse.forbidden('Not enrolled in this course');
          return res.status(statusCode).json(response);
        }
      } else {
        // Otherwise, filter by all enrolled courses
        query.course = { $in: enrolledCourseIds };
      }
    } else if (req.user.role === 'faculty') {
      // Faculty can only see assignments for courses they teach
      // Get courses the faculty teaches
      const courses = await Course.find({
        instructor: req.user.id
      }).select('_id');

      const taughtCourseIds = courses.map(course => course._id);

      if (taughtCourseIds.length === 0) {
        const { statusCode, response } = apiResponse.success(
          'No assignments found',
          {
            count: 0,
            assignments: []
          }
        );
        return res.status(statusCode).json(response);
      }

      // Filter by taught courses
      if (query.course) {
        // If specific course is requested, check if faculty teaches it
        if (!taughtCourseIds.includes(query.course)) {
          const { statusCode, response } = apiResponse.forbidden('Not teaching this course');
          return res.status(statusCode).json(response);
        }
      } else {
        // Otherwise, filter by all taught courses
        query.course = { $in: taughtCourseIds };
      }
    }

    // Execute query
    const assignments = await Assignment.find(query)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('files')
      .populate({
        path: 'submissions.student',
        select: 'name email studentId'
      })
      .populate('submissions.files')
      .sort({ createdAt: -1 });

    // Filter submissions based on user role
    const filteredAssignments = assignments.map(assignment => {
      const assignmentObj = assignment.toObject();

      // Students can only see their own submissions
      if (req.user.role === 'student') {
        assignmentObj.submissions = assignmentObj.submissions.filter(
          submission => submission.student._id.toString() === req.user.id
        );
      }

      return assignmentObj;
    });

    const { statusCode, response } = apiResponse.success(
      'Assignments retrieved successfully',
      {
        count: filteredAssignments.length,
        assignments: filteredAssignments
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('files')
      .populate({
        path: 'submissions.student',
        select: 'name email studentId'
      })
      .populate('submissions.files');

    if (!assignment) {
      const { statusCode, response } = apiResponse.notFound('Assignment not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is authorized to access this assignment
    if (req.user.role === 'student') {
      // Students can only see published assignments for courses they're enrolled in
      if (assignment.status !== 'published') {
        const { statusCode, response } = apiResponse.forbidden('Assignment is not published');
        return res.status(statusCode).json(response);
      }

      // Check if student is enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: assignment.course._id,
        status: 'active'
      });

      if (!enrollment) {
        const { statusCode, response } = apiResponse.forbidden('Not enrolled in this course');
        return res.status(statusCode).json(response);
      }

      // Filter submissions to only show student's own
      const assignmentObj = assignment.toObject();
      assignmentObj.submissions = assignmentObj.submissions.filter(
        submission => submission.student._id.toString() === req.user.id
      );

      const { statusCode, response } = apiResponse.success(
        'Assignment retrieved successfully',
        { assignment: assignmentObj }
      );

      return res.status(statusCode).json(response);
    } else if (req.user.role === 'faculty') {
      // Faculty can only see assignments for courses they teach
      const course = await Course.findById(assignment.course._id);

      if (!course || course.instructor.toString() !== req.user.id) {
        const { statusCode, response } = apiResponse.forbidden('Not teaching this course');
        return res.status(statusCode).json(response);
      }
    }

    const { statusCode, response } = apiResponse.success(
      'Assignment retrieved successfully',
      { assignment }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/Admin/Faculty
exports.createAssignment = async (req, res, next) => {
  try {
    // Check if user is authorized to create assignments
    if (req.user.role === 'student') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to create assignments');
      return res.status(statusCode).json(response);
    }

    // Set the user who created the assignment
    req.body.createdBy = req.user.id;

    // Validate assignment data
    const { isValid, errors } = validateAssignment(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error(
        'Validation failed',
        400,
        errors
      );
      return res.status(statusCode).json(response);
    }

    // Check if course exists
    const course = await Course.findById(req.body.course);

    if (!course) {
      const { statusCode, response } = apiResponse.notFound('Course not found');
      return res.status(statusCode).json(response);
    }

    // Check if faculty is teaching this course
    if (req.user.role === 'faculty' && course.instructor.toString() !== req.user.id) {
      const { statusCode, response } = apiResponse.forbidden('Not teaching this course');
      return res.status(statusCode).json(response);
    }

    // Create assignment
    const assignment = await Assignment.create(req.body);

    // Populate assignment with related data
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title code')
      .populate('createdBy', 'name email');

    // If assignment is published, send notifications to enrolled students
    if (req.body.status === 'published') {
      try {
        // Get enrolled students
        const enrollments = await Enrollment.find({
          course: req.body.course,
          status: 'active'
        }).populate('student', 'name');

        // Send notification to each student
        for (const enrollment of enrollments) {
          await createNotificationUtil({
            recipient: enrollment.student._id,
            sender: req.user.id,
            type: 'assignment',
            title: 'New Assignment',
            message: `A new assignment "${req.body.title}" has been posted in ${populatedAssignment.course.code}.`,
            relatedModel: 'Assignment',
            relatedId: assignment._id,
            link: `/assignments/${assignment._id}`
          }, req.app.get('io'));
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
        // Continue even if notifications fail
      }
    }

    const { statusCode, response } = apiResponse.success(
      'Assignment created successfully',
      { assignment: populatedAssignment },
      201
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Admin/Faculty
exports.updateAssignment = async (req, res, next) => {
  try {
    // Check if user is authorized to update assignments
    if (req.user.role === 'student') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to update assignments');
      return res.status(statusCode).json(response);
    }

    // Find assignment
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      const { statusCode, response } = apiResponse.notFound('Assignment not found');
      return res.status(statusCode).json(response);
    }

    // Check if faculty is the creator of this assignment or teaching this course
    if (req.user.role === 'faculty') {
      if (assignment.createdBy.toString() !== req.user.id) {
        const course = await Course.findById(assignment.course);

        if (!course || course.instructor.toString() !== req.user.id) {
          const { statusCode, response } = apiResponse.forbidden('Not authorized to update this assignment');
          return res.status(statusCode).json(response);
        }
      }
    }

    // Validate assignment data
    const updateData = { ...req.body };

    // Ensure createdBy is not changed
    delete updateData.createdBy;

    // Ensure submissions are not changed through this endpoint
    delete updateData.submissions;

    // Add missing required fields for validation
    const dataToValidate = {
      ...updateData,
      createdBy: assignment.createdBy,
      title: updateData.title || assignment.title,
      description: updateData.description || assignment.description,
      course: updateData.course || assignment.course,
      dueDate: updateData.dueDate || assignment.dueDate,
      points: updateData.points !== undefined ? updateData.points : assignment.points,
    };

    const { isValid, errors } = validateAssignment(dataToValidate);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error(
        'Validation failed',
        400,
        errors
      );
      return res.status(statusCode).json(response);
    }

    // If course is being changed, check if it exists and faculty is teaching it
    if (updateData.course && updateData.course !== assignment.course.toString()) {
      const course = await Course.findById(updateData.course);

      if (!course) {
        const { statusCode, response } = apiResponse.notFound('Course not found');
        return res.status(statusCode).json(response);
      }

      if (req.user.role === 'faculty' && course.instructor.toString() !== req.user.id) {
        const { statusCode, response } = apiResponse.forbidden('Not teaching this course');
        return res.status(statusCode).json(response);
      }
    }

    // Update assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('files')
      .populate({
        path: 'submissions.student',
        select: 'name email studentId'
      })
      .populate('submissions.files');

    const { statusCode, response } = apiResponse.success(
      'Assignment updated successfully',
      { assignment: updatedAssignment }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Admin/Faculty
exports.deleteAssignment = async (req, res, next) => {
  try {
    // Check if user is authorized to delete assignments
    if (req.user.role === 'student') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to delete assignments');
      return res.status(statusCode).json(response);
    }

    // Find assignment
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      const { statusCode, response } = apiResponse.notFound('Assignment not found');
      return res.status(statusCode).json(response);
    }

    // Check if faculty is the creator of this assignment or teaching this course
    if (req.user.role === 'faculty') {
      if (assignment.createdBy.toString() !== req.user.id) {
        const course = await Course.findById(assignment.course);

        if (!course || course.instructor.toString() !== req.user.id) {
          const { statusCode, response } = apiResponse.forbidden('Not authorized to delete this assignment');
          return res.status(statusCode).json(response);
        }
      }
    }

    // Delete associated files
    // 1. Get all file IDs
    const fileIds = [...assignment.files];

    // 2. Add submission file IDs
    assignment.submissions.forEach(submission => {
      fileIds.push(...submission.files);
    });

    // 3. Delete files from database and disk
    for (const fileId of fileIds) {
      const file = await File.findById(fileId);

      if (file) {
        // Delete file from disk
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        // Delete file from database
        await file.deleteOne();
      }
    }

    // Delete assignment
    await assignment.deleteOne();

    const { statusCode, response } = apiResponse.success('Assignment deleted successfully');

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res, next) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      const { statusCode, response } = apiResponse.forbidden('Only students can submit assignments');
      return res.status(statusCode).json(response);
    }

    // Find assignment
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      const { statusCode, response } = apiResponse.notFound('Assignment not found');
      return res.status(statusCode).json(response);
    }

    // Check if assignment is published
    if (assignment.status !== 'published') {
      const { statusCode, response } = apiResponse.forbidden('Assignment is not published');
      return res.status(statusCode).json(response);
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: assignment.course,
      status: 'active'
    });

    if (!enrollment) {
      const { statusCode, response } = apiResponse.forbidden('Not enrolled in this course');
      return res.status(statusCode).json(response);
    }

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    // Create submission data
    const submissionData = {
      student: req.user.id,
      files: req.body.files,
      submittedAt: now,
      status: isLate ? 'late' : 'submitted'
    };

    // Validate submission data
    const { isValid, errors } = validateSubmission(submissionData);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error(
        'Validation failed',
        400,
        errors
      );
      return res.status(statusCode).json(response);
    }

    // Check if files exist and belong to the student
    for (const fileId of submissionData.files) {
      const file = await File.findById(fileId);

      if (!file) {
        const { statusCode, response } = apiResponse.notFound(`File with ID ${fileId} not found`);
        return res.status(statusCode).json(response);
      }

      if (file.uploadedBy.toString() !== req.user.id) {
        const { statusCode, response } = apiResponse.forbidden(`Not authorized to use file with ID ${fileId}`);
        return res.status(statusCode).json(response);
      }

      if (file.fileType !== 'submission') {
        const { statusCode, response } = apiResponse.error(`File with ID ${fileId} is not a submission file`, 400);
        return res.status(statusCode).json(response);
      }

      // Update file with assignment ID if not already set
      if (!file.assignment) {
        await File.findByIdAndUpdate(fileId, { assignment: assignment._id });
      }
    }

    // Check if student already has a submission
    const existingSubmissionIndex = assignment.submissions.findIndex(
      sub => sub.student.toString() === req.user.id
    );

    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      assignment.submissions[existingSubmissionIndex].files = submissionData.files;
      assignment.submissions[existingSubmissionIndex].submittedAt = submissionData.submittedAt;
      assignment.submissions[existingSubmissionIndex].status = submissionData.status;
    } else {
      // Add new submission
      assignment.submissions.push(submissionData);
    }

    // Save assignment
    await assignment.save();

    // Get updated assignment with populated data
    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('files')
      .populate({
        path: 'submissions.student',
        select: 'name email studentId'
      })
      .populate('submissions.files');

    // Send notification to instructor
    try {
      // Get course instructor
      const course = await Course.findById(assignment.course).populate('instructor', 'name');

      if (course && course.instructor) {
        await createNotificationUtil({
          recipient: course.instructor._id,
          sender: req.user.id,
          type: 'submission',
          title: 'Assignment Submission',
          message: `${req.user.name} has submitted the assignment "${assignment.title}".`,
          relatedModel: 'Assignment',
          relatedId: assignment._id,
          link: `/assignments/${assignment._id}`
        }, req.app.get('io'));
      }
    } catch (error) {
      console.error('Error sending notification to instructor:', error);
      // Continue even if notification fails
    }

    // Filter submissions to only show student's own
    const assignmentObj = updatedAssignment.toObject();
    assignmentObj.submissions = assignmentObj.submissions.filter(
      submission => submission.student._id.toString() === req.user.id
    );

    const { statusCode, response } = apiResponse.success(
      'Assignment submitted successfully',
      { assignment: assignmentObj }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/:id/grade/:studentId
// @access  Private/Admin/Faculty
exports.gradeSubmission = async (req, res, next) => {
  try {
    // Check if user is authorized to grade submissions
    if (req.user.role === 'student') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to grade submissions');
      return res.status(statusCode).json(response);
    }

    // Find assignment
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      const { statusCode, response } = apiResponse.notFound('Assignment not found');
      return res.status(statusCode).json(response);
    }

    // Check if faculty is teaching this course
    if (req.user.role === 'faculty') {
      const course = await Course.findById(assignment.course);

      if (!course || course.instructor.toString() !== req.user.id) {
        const { statusCode, response } = apiResponse.forbidden('Not teaching this course');
        return res.status(statusCode).json(response);
      }
    }

    // Find student submission
    const submissionIndex = assignment.submissions.findIndex(
      sub => sub.student.toString() === req.params.studentId
    );

    if (submissionIndex === -1) {
      const { statusCode, response } = apiResponse.notFound('Submission not found');
      return res.status(statusCode).json(response);
    }

    // Validate grade
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null) {
      const { statusCode, response } = apiResponse.error('Grade is required', 400);
      return res.status(statusCode).json(response);
    }

    if (isNaN(Number(grade))) {
      const { statusCode, response } = apiResponse.error('Grade must be a number', 400);
      return res.status(statusCode).json(response);
    }

    if (Number(grade) < 0 || Number(grade) > assignment.points) {
      const { statusCode, response } = apiResponse.error(`Grade must be between 0 and ${assignment.points}`, 400);
      return res.status(statusCode).json(response);
    }

    // Update submission
    assignment.submissions[submissionIndex].grade = Number(grade);
    assignment.submissions[submissionIndex].feedback = feedback || '';
    assignment.submissions[submissionIndex].status = 'graded';

    // Save assignment
    await assignment.save();

    // Get updated assignment with populated data
    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('files')
      .populate({
        path: 'submissions.student',
        select: 'name email studentId'
      })
      .populate('submissions.files');

    // Send notification to student
    try {
      await createNotificationUtil({
        recipient: req.params.studentId,
        sender: req.user.id,
        type: 'grade',
        title: 'Assignment Graded',
        message: `Your submission for "${assignment.title}" has been graded. You received ${grade}/${assignment.points} points.`,
        relatedModel: 'Assignment',
        relatedId: assignment._id,
        link: `/assignments/${assignment._id}`
      }, req.app.get('io'));
    } catch (error) {
      console.error('Error sending notification to student:', error);
      // Continue even if notification fails
    }

    const { statusCode, response } = apiResponse.success(
      'Submission graded successfully',
      { assignment: updatedAssignment }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
