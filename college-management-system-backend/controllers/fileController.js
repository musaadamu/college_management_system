const { File, Course, Assignment, User, Message } = require('../models');
const { validateFile } = require('../validations/fileValidation');
const apiResponse = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');
const upload = require('../utils/fileUpload');
const multer = require('multer');

// Use the file upload utility from utils/fileUpload.js
const uploadMiddleware = upload.single('file');

// @desc    Upload a file
// @route   POST /api/files
// @access  Private
exports.uploadFile = async (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        // Multer error
        const { statusCode, response } = apiResponse.error(
          err.message,
          400
        );
        return res.status(statusCode).json(response);
      } else if (err) {
        // Other error
        const { statusCode, response } = apiResponse.error(
          err.message,
          400
        );
        return res.status(statusCode).json(response);
      }

      // Check if file was uploaded
      if (!req.file) {
        const { statusCode, response } = apiResponse.error(
          'No file uploaded',
          400
        );
        return res.status(statusCode).json(response);
      }

      // Get file data from request
      const {
        name = req.file.originalname,
        description = '',
        fileType,
        course,
        assignment,
        isPublic = false,
      } = req.body;

      // Create file data object
      const fileData = {
        name,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`,
        uploadedBy: req.user.id,
        fileType,
        description,
        isPublic: isPublic === 'true',
        course,
        assignment,
      };

      // Validate file data
      const { isValid, errors } = validateFile(fileData);

      if (!isValid) {
        // Delete uploaded file if validation fails
        fs.unlinkSync(req.file.path);

        const { statusCode, response } = apiResponse.error(
          'Validation failed',
          400,
          errors
        );
        return res.status(statusCode).json(response);
      }

      // Check if course exists if provided
      if (course) {
        const courseExists = await Course.findById(course);
        if (!courseExists) {
          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          const { statusCode, response } = apiResponse.error(
            'Course not found',
            404
          );
          return res.status(statusCode).json(response);
        }

        // Check if user is authorized to upload to this course
        if (req.user.role === 'student' && fileType === 'resource') {
          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          const { statusCode, response } = apiResponse.error(
            'Students cannot upload resource files to courses',
            403
          );
          return res.status(statusCode).json(response);
        }
      }

      // Check if assignment exists if provided
      if (assignment) {
        const assignmentExists = await Assignment.findById(assignment);
        if (!assignmentExists) {
          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          const { statusCode, response } = apiResponse.error(
            'Assignment not found',
            404
          );
          return res.status(statusCode).json(response);
        }

        // Check if user is authorized to upload to this assignment
        if (req.user.role === 'student' && fileType !== 'submission') {
          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          const { statusCode, response } = apiResponse.error(
            'Students can only upload submission files to assignments',
            403
          );
          return res.status(statusCode).json(response);
        }

        if ((req.user.role === 'faculty' || req.user.role === 'admin') &&
            fileType === 'submission') {
          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          const { statusCode, response } = apiResponse.error(
            'Faculty and admin cannot upload submission files',
            403
          );
          return res.status(statusCode).json(response);
        }
      }

      // Create file in database
      const file = await File.create(fileData);

      // If file is for an assignment, update the assignment
      if (assignment && file) {
        if (fileType === 'assignment') {
          // Add file to assignment files
          await Assignment.findByIdAndUpdate(
            assignment,
            { $push: { files: file._id } }
          );
        } else if (fileType === 'submission') {
          // Add file to assignment submission
          const assignmentDoc = await Assignment.findById(assignment);

          // Check if student already has a submission
          const existingSubmission = assignmentDoc.submissions.find(
            sub => sub.student.toString() === req.user.id
          );

          if (existingSubmission) {
            // Add file to existing submission
            await Assignment.updateOne(
              {
                _id: assignment,
                'submissions.student': req.user.id
              },
              {
                $push: { 'submissions.$.files': file._id },
                $set: {
                  'submissions.$.submittedAt': Date.now(),
                  'submissions.$.status': 'submitted'
                }
              }
            );
          } else {
            // Create new submission
            await Assignment.findByIdAndUpdate(
              assignment,
              {
                $push: {
                  submissions: {
                    student: req.user.id,
                    files: [file._id],
                    submittedAt: Date.now(),
                    status: 'submitted'
                  }
                }
              }
            );
          }
        }
      }

      // Populate file with related data
      const populatedFile = await File.findById(file._id)
        .populate('uploadedBy', 'name email')
        .populate('course', 'title code')
        .populate('assignment', 'title');

      const { statusCode, response } = apiResponse.success(
        'File uploaded successfully',
        { file: populatedFile },
        201
      );

      res.status(statusCode).json(response);
    } catch (error) {
      // Delete uploaded file if an error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      next(error);
    }
  });
};

// @desc    Get all files
// @route   GET /api/files
// @access  Private
exports.getFiles = async (req, res, next) => {
  try {
    // Build query
    let query = {};

    // Filter by course if provided
    if (req.query.course) {
      query.course = req.query.course;
    }

    // Filter by assignment if provided
    if (req.query.assignment) {
      query.assignment = req.query.assignment;
    }

    // Filter by file type if provided
    if (req.query.fileType) {
      query.fileType = req.query.fileType;
    }

    // Filter by user role
    if (req.user.role === 'student') {
      // Students can see:
      // 1. Public files
      // 2. Their own files
      // 3. Resource files for courses they're enrolled in
      query.$or = [
        { isPublic: true },
        { uploadedBy: req.user.id },
        { fileType: 'resource' }
      ];
    } else if (req.user.role === 'faculty') {
      // Faculty can see:
      // 1. Public files
      // 2. Their own files
      // 3. Files for courses they teach
      // 4. Submission files for their assignments
      query.$or = [
        { isPublic: true },
        { uploadedBy: req.user.id }
      ];
    }

    // Execute query
    const files = await File.find(query)
      .populate('uploadedBy', 'name email')
      .populate('course', 'title code')
      .populate('assignment', 'title')
      .sort({ createdAt: -1 });

    const { statusCode, response } = apiResponse.success(
      'Files retrieved successfully',
      {
        count: files.length,
        files
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get file by ID
// @route   GET /api/files/:id
// @access  Private
exports.getFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('course', 'title code')
      .populate('assignment', 'title');

    if (!file) {
      const { statusCode, response } = apiResponse.notFound('File not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is authorized to access this file
    if (req.user.role === 'student') {
      // Students can access:
      // 1. Public files
      // 2. Their own files
      // 3. Resource files for courses they're enrolled in
      if (!file.isPublic &&
          file.uploadedBy._id.toString() !== req.user.id &&
          file.fileType !== 'resource') {
        const { statusCode, response } = apiResponse.forbidden('Not authorized to access this file');
        return res.status(statusCode).json(response);
      }
    }

    const { statusCode, response } = apiResponse.success(
      'File retrieved successfully',
      { file }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
exports.downloadFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      const { statusCode, response } = apiResponse.notFound('File not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is authorized to access this file
    if (req.user.role === 'student') {
      // Students can access:
      // 1. Public files
      // 2. Their own files
      // 3. Resource files for courses they're enrolled in
      if (!file.isPublic &&
          file.uploadedBy.toString() !== req.user.id &&
          file.fileType !== 'resource') {
        const { statusCode, response } = apiResponse.forbidden('Not authorized to access this file');
        return res.status(statusCode).json(response);
      }
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      const { statusCode, response } = apiResponse.notFound('File not found on server');
      return res.status(statusCode).json(response);
    }

    // Set content disposition header
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);

    // Stream file to response
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      const { statusCode, response } = apiResponse.notFound('File not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is authorized to delete this file
    if (req.user.role !== 'admin' && file.uploadedBy.toString() !== req.user.id) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to delete this file');
      return res.status(statusCode).json(response);
    }

    // If file is for an assignment, update the assignment
    if (file.assignment) {
      if (file.fileType === 'assignment') {
        // Remove file from assignment files
        await Assignment.findByIdAndUpdate(
          file.assignment,
          { $pull: { files: file._id } }
        );
      } else if (file.fileType === 'submission') {
        // Remove file from assignment submission
        await Assignment.updateOne(
          {
            _id: file.assignment,
            'submissions.student': file.uploadedBy
          },
          { $pull: { 'submissions.$.files': file._id } }
        );

        // If no files left in submission, update status to missing
        const assignment = await Assignment.findById(file.assignment);
        const submission = assignment.submissions.find(
          sub => sub.student.toString() === file.uploadedBy.toString()
        );

        if (submission && submission.files.length === 1) {
          await Assignment.updateOne(
            {
              _id: file.assignment,
              'submissions.student': file.uploadedBy
            },
            { $set: { 'submissions.$.status': 'missing' } }
          );
        }
      }
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file from database
    await file.deleteOne();

    const { statusCode, response } = apiResponse.success('File deleted successfully');

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
