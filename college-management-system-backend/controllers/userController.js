const { User, Enrollment, Course, Attendance } = require('../models');
const { validateUser } = require('../validations/userValidation');
const apiResponse = require('../utils/apiResponse');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Build query with filters
    let query = {};

    // Filter by name if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    // Filter by email if provided
    if (req.query.email) {
      query.email = { $regex: req.query.email, $options: 'i' };
    }

    // Filter by role if provided
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by studentId if provided
    if (req.query.studentId) {
      query.studentId = { $regex: req.query.studentId, $options: 'i' };
    }

    // Filter by facultyId if provided
    if (req.query.facultyId) {
      query.facultyId = { $regex: req.query.facultyId, $options: 'i' };
    }

    // Execute query
    const users = await User.find(query).select('-password');

    const { statusCode, response } = apiResponse.success(
      'Users retrieved successfully',
      {
        count: users.length,
        users
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      const { statusCode, response } = apiResponse.notFound('User not found');
      return res.status(statusCode).json(response);
    }

    const { statusCode, response } = apiResponse.success(
      'User retrieved successfully',
      { user }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    // Validate user data
    const { isValid, errors } = validateUser(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      const { statusCode, response } = apiResponse.error('Email already in use', 400);
      return res.status(statusCode).json(response);
    }

    // Check if studentId already exists (for students)
    if (req.body.role === 'student' && req.body.studentId) {
      const existingStudent = await User.findOne({ studentId: req.body.studentId });
      if (existingStudent) {
        const { statusCode, response } = apiResponse.error('Student ID already in use', 400);
        return res.status(statusCode).json(response);
      }
    }

    // Check if facultyId already exists (for faculty)
    if (req.body.role === 'faculty' && req.body.facultyId) {
      const existingFaculty = await User.findOne({ facultyId: req.body.facultyId });
      if (existingFaculty) {
        const { statusCode, response } = apiResponse.error('Faculty ID already in use', 400);
        return res.status(statusCode).json(response);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user with hashed password
    const userData = {
      ...req.body,
      password: hashedPassword
    };

    const user = await User.create(userData);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    const { statusCode, response } = apiResponse.success(
      'User created successfully',
      { user: userResponse },
      201
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Find user to update
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      const { statusCode, response } = apiResponse.notFound('User not found');
      return res.status(statusCode).json(response);
    }

    // Validate user data
    const { isValid, errors } = validateUser(req.body, true);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // Check if email is being changed and already exists
    if (req.body.email && req.body.email !== userToUpdate.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        const { statusCode, response } = apiResponse.error('Email already in use', 400);
        return res.status(statusCode).json(response);
      }
    }

    // Check if studentId is being changed and already exists
    if (req.body.studentId && req.body.studentId !== userToUpdate.studentId) {
      const existingStudent = await User.findOne({ studentId: req.body.studentId });
      if (existingStudent) {
        const { statusCode, response } = apiResponse.error('Student ID already in use', 400);
        return res.status(statusCode).json(response);
      }
    }

    // Check if facultyId is being changed and already exists
    if (req.body.facultyId && req.body.facultyId !== userToUpdate.facultyId) {
      const existingFaculty = await User.findOne({ facultyId: req.body.facultyId });
      if (existingFaculty) {
        const { statusCode, response } = apiResponse.error('Faculty ID already in use', 400);
        return res.status(statusCode).json(response);
      }
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Hash password if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    const { statusCode, response } = apiResponse.success(
      'User updated successfully',
      { user }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const { statusCode, response } = apiResponse.notFound('User not found');
      return res.status(statusCode).json(response);
    }

    // Check if user has enrollments
    const enrollments = await Enrollment.find({ student: req.params.id });
    if (enrollments.length > 0) {
      const { statusCode, response } = apiResponse.error(
        'Cannot delete user with enrollments. Please delete enrollments first.',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Check if user is a faculty member teaching courses
    const courses = await Course.find({ instructor: req.params.id });
    if (courses.length > 0) {
      const { statusCode, response } = apiResponse.error(
        'Cannot delete faculty member teaching courses. Please reassign courses first.',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Check if user has marked attendance
    const attendanceRecords = await Attendance.find({ markedBy: req.params.id });
    if (attendanceRecords.length > 0) {
      const { statusCode, response } = apiResponse.error(
        'Cannot delete user who has marked attendance records.',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Delete user
    await user.deleteOne();

    const { statusCode, response } = apiResponse.success('User deleted successfully');

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
