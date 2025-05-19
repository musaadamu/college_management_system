const { Enrollment, Course, User } = require('../models');
const { validateEnrollment } = require('../validations/enrollmentValidation');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private/Admin
exports.getEnrollments = async (req, res, next) => {
  try {
    // Build query with filters
    let query = {};

    // If user is faculty, only show enrollments for courses they teach
    if (req.user.role === 'faculty') {
      // First, find courses taught by this faculty
      const courses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = courses.map(course => course._id);

      // Then filter enrollments by these courses
      query.course = { $in: courseIds };
    }
    // If user is student, only show their enrollments
    else if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    // Filter by student if provided
    if (req.query.student) {
      query.student = req.query.student;
    }

    // Filter by course if provided
    if (req.query.course) {
      query.course = req.query.course;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by semester if provided
    if (req.query.semester) {
      query.semester = req.query.semester;
    }

    // Filter by year if provided
    if (req.query.year) {
      query.year = req.query.year;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email studentId')
      .populate({
        path: 'course',
        select: 'title code credits',
        populate: {
          path: 'department',
          select: 'name code'
        }
      });

    const { statusCode, response } = apiResponse.success(
      'Enrollments retrieved successfully',
      {
        count: enrollments.length,
        enrollments
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
exports.getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate({
        path: 'course',
        select: 'title code credits',
        populate: {
          path: 'department',
          select: 'name code'
        }
      });

    if (!enrollment) {
      const { statusCode, response } = apiResponse.notFound('Enrollment not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is admin, faculty teaching the course, or the enrolled student
    const isAdmin = req.user.role === 'admin';
    const isStudent = enrollment.student._id.toString() === req.user.id;

    let isFacultyTeachingCourse = false;
    if (req.user.role === 'faculty') {
      const course = await Course.findById(enrollment.course).select('instructor');
      isFacultyTeachingCourse = course && course.instructor &&
                               course.instructor.toString() === req.user.id;
    }

    if (!isAdmin && !isStudent && !isFacultyTeachingCourse) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to access this enrollment');
      return res.status(statusCode).json(response);
    }

    const { statusCode, response } = apiResponse.success(
      'Enrollment retrieved successfully',
      { enrollment }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create enrollment
// @route   POST /api/enrollments
// @access  Private
exports.createEnrollment = async (req, res, next) => {
  try {
    // Validate enrollment data
    const { isValid, errors } = validateEnrollment(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // If student is not specified and user is a student, set student to current user
    if (!req.body.student && req.user.role === 'student') {
      req.body.student = req.user.id;
    }

    // Check if student exists
    const studentExists = await User.findById(req.body.student);
    if (!studentExists || studentExists.role !== 'student') {
      const { statusCode, response } = apiResponse.error('Student not found or user is not a student', 400);
      return res.status(statusCode).json(response);
    }

    // Check if course exists
    const courseExists = await Course.findById(req.body.course);
    if (!courseExists) {
      const { statusCode, response } = apiResponse.error('Course not found', 400);
      return res.status(statusCode).json(response);
    }

    // Check if student is already enrolled in this course for the same semester/year
    const existingEnrollment = await Enrollment.findOne({
      student: req.body.student,
      course: req.body.course,
      semester: req.body.semester,
      year: req.body.year,
      status: { $ne: 'dropped' } // Exclude dropped enrollments
    });

    if (existingEnrollment) {
      const { statusCode, response } = apiResponse.error(
        'Student is already enrolled in this course for the specified semester/year',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Create enrollment
    const enrollment = await Enrollment.create(req.body);

    const { statusCode, response } = apiResponse.success(
      'Enrollment created successfully',
      { enrollment },
      201
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment
// @route   PUT /api/enrollments/:id
// @access  Private
exports.updateEnrollment = async (req, res, next) => {
  try {
    // Validate enrollment data if provided
    if (Object.keys(req.body).length > 0) {
      const { isValid, errors } = validateEnrollment({
        ...req.body,
        // Include required fields that might not be in the update
        student: req.body.student || 'placeholder',
        course: req.body.course || 'placeholder',
        semester: req.body.semester || 'Fall',
        year: req.body.year || new Date().getFullYear()
      });

      if (!isValid) {
        const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
        return res.status(statusCode).json(response);
      }
    }

    let enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      const { statusCode, response } = apiResponse.notFound('Enrollment not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is admin, faculty teaching the course, or the enrolled student
    const isAdmin = req.user.role === 'admin';
    const isStudent = enrollment.student.toString() === req.user.id;

    let isFacultyTeachingCourse = false;
    if (req.user.role === 'faculty') {
      const course = await Course.findById(enrollment.course).select('instructor');
      isFacultyTeachingCourse = course && course.instructor &&
                               course.instructor.toString() === req.user.id;
    }

    if (!isAdmin && !isStudent && !isFacultyTeachingCourse) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to update this enrollment');
      return res.status(statusCode).json(response);
    }

    // If user is a student, they can only update status to 'dropped'
    if (req.user.role === 'student') {
      if (req.body.status && req.body.status !== 'dropped') {
        const { statusCode, response } = apiResponse.forbidden('Students can only drop courses');
        return res.status(statusCode).json(response);
      }

      // Students cannot update grades
      if (req.body.grade || req.body.gradePoints) {
        const { statusCode, response } = apiResponse.forbidden('Students cannot update grades');
        return res.status(statusCode).json(response);
      }
    }

    // If faculty, they can only update grades and status
    if (req.user.role === 'faculty' && !isAdmin) {
      const allowedFields = ['grade', 'gradePoints', 'status'];
      const providedFields = Object.keys(req.body);

      const invalidFields = providedFields.filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        const { statusCode, response } = apiResponse.forbidden(
          `Faculty can only update: ${allowedFields.join(', ')}`
        );
        return res.status(statusCode).json(response);
      }
    }

    // Update enrollment
    enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const { statusCode, response } = apiResponse.success(
      'Enrollment updated successfully',
      { enrollment }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private/Admin
exports.deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      const { statusCode, response } = apiResponse.notFound('Enrollment not found');
      return res.status(statusCode).json(response);
    }

    // Only admin can delete enrollments
    if (req.user.role !== 'admin') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to delete enrollments');
      return res.status(statusCode).json(response);
    }

    await enrollment.deleteOne();

    const { statusCode, response } = apiResponse.success('Enrollment deleted successfully');

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
