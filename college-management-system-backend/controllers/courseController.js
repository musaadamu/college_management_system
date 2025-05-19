const { Course, Department, Enrollment } = require('../models');
const { validateCourse } = require('../validations/courseValidation');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    // Build query with filters
    let query = {};

    // Filter by title if provided
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: 'i' };
    }

    // Filter by code if provided
    if (req.query.code) {
      query.code = { $regex: req.query.code, $options: 'i' };
    }

    // Filter by department if provided
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Filter by semester if provided
    if (req.query.semester) {
      query.semester = req.query.semester;
    }

    // Filter by year if provided
    if (req.query.year) {
      query.year = req.query.year;
    }

    const courses = await Course.find(query)
      .populate('department', 'name code')
      .populate('instructor', 'name email')
      .populate('prerequisites', 'title code');

    const { statusCode, response } = apiResponse.success(
      'Courses retrieved successfully',
      {
        count: courses.length,
        courses
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('department', 'name code')
      .populate('instructor', 'name email')
      .populate('prerequisites', 'title code');

    if (!course) {
      const { statusCode, response } = apiResponse.notFound('Course not found');
      return res.status(statusCode).json(response);
    }

    const { statusCode, response } = apiResponse.success(
      'Course retrieved successfully',
      { course }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res, next) => {
  try {
    // Validate course data
    const { isValid, errors } = validateCourse(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // Check if department exists
    const departmentExists = await Department.findById(req.body.department);
    if (!departmentExists) {
      const { statusCode, response } = apiResponse.error('Department not found', 400);
      return res.status(statusCode).json(response);
    }

    // Check if course with same code already exists
    const existingCourse = await Course.findOne({ code: req.body.code });
    if (existingCourse) {
      const { statusCode, response } = apiResponse.error(
        'Course with this code already exists',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Check if prerequisites exist
    if (req.body.prerequisites && req.body.prerequisites.length > 0) {
      for (const prereqId of req.body.prerequisites) {
        const prerequisite = await Course.findById(prereqId);
        if (!prerequisite) {
          const { statusCode, response } = apiResponse.error(
            `Prerequisite course with ID ${prereqId} not found`,
            400
          );
          return res.status(statusCode).json(response);
        }
      }
    }

    const course = await Course.create(req.body);

    const { statusCode, response } = apiResponse.success(
      'Course created successfully',
      { course },
      201
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res, next) => {
  try {
    // Validate course data
    const { isValid, errors } = validateCourse(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // Check if course exists
    let course = await Course.findById(req.params.id);
    if (!course) {
      const { statusCode, response } = apiResponse.notFound('Course not found');
      return res.status(statusCode).json(response);
    }

    // Check if department exists
    if (req.body.department) {
      const departmentExists = await Department.findById(req.body.department);
      if (!departmentExists) {
        const { statusCode, response } = apiResponse.error('Department not found', 400);
        return res.status(statusCode).json(response);
      }
    }

    // Check if updating code and if it already exists
    if (req.body.code && req.body.code !== course.code) {
      const existingCourse = await Course.findOne({ code: req.body.code });
      if (existingCourse) {
        const { statusCode, response } = apiResponse.error(
          'Course with this code already exists',
          400
        );
        return res.status(statusCode).json(response);
      }
    }

    // Check if prerequisites exist
    if (req.body.prerequisites && req.body.prerequisites.length > 0) {
      for (const prereqId of req.body.prerequisites) {
        // Skip if the prerequisite is the course itself
        if (prereqId === req.params.id) {
          const { statusCode, response } = apiResponse.error(
            'A course cannot be a prerequisite for itself',
            400
          );
          return res.status(statusCode).json(response);
        }

        const prerequisite = await Course.findById(prereqId);
        if (!prerequisite) {
          const { statusCode, response } = apiResponse.error(
            `Prerequisite course with ID ${prereqId} not found`,
            400
          );
          return res.status(statusCode).json(response);
        }
      }
    }

    // Update course
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const { statusCode, response } = apiResponse.success(
      'Course updated successfully',
      { course }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res, next) => {
  try {
    // Check if course exists
    const course = await Course.findById(req.params.id);

    if (!course) {
      const { statusCode, response } = apiResponse.notFound('Course not found');
      return res.status(statusCode).json(response);
    }

    // Check if course is a prerequisite for other courses
    const prerequisiteFor = await Course.countDocuments({ prerequisites: req.params.id });
    if (prerequisiteFor > 0) {
      const { statusCode, response } = apiResponse.error(
        `Cannot delete course as it is a prerequisite for ${prerequisiteFor} other courses`,
        400
      );
      return res.status(statusCode).json(response);
    }

    // Check if course has enrollments
    const enrollments = await Enrollment.countDocuments({ course: req.params.id });
    if (enrollments > 0) {
      const { statusCode, response } = apiResponse.error(
        `Cannot delete course with ${enrollments} active enrollments`,
        400
      );
      return res.status(statusCode).json(response);
    }

    // Delete course
    await course.deleteOne();

    const { statusCode, response } = apiResponse.success(
      'Course deleted successfully'
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
