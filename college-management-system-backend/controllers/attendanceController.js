const { Attendance, Course, User, Enrollment } = require('../models');
const { validateAttendance } = require('../validations/attendanceValidation');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private/Admin/Faculty
exports.getAttendances = async (req, res, next) => {
  try {
    // Build query
    let query = {};

    // If user is faculty, only show attendance for courses they teach
    if (req.user.role === 'faculty') {
      // First, find courses taught by this faculty
      const courses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = courses.map(course => course._id);

      // Then filter attendance by these courses
      query.course = { $in: courseIds };
    }
    // If user is student, only show their attendance
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

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    } else if (req.query.date) {
      // For a specific date
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: date,
        $lt: nextDay
      };
    }

    // Execute query with population
    const attendances = await Attendance.find(query)
      .populate('student', 'name email studentId')
      .populate({
        path: 'course',
        select: 'title code',
        populate: {
          path: 'department',
          select: 'name code'
        }
      })
      .populate('markedBy', 'name email')
      .sort({ date: -1 }); // Sort by date, newest first

    const { statusCode, response } = apiResponse.success(
      'Attendance records retrieved successfully',
      {
        count: attendances.length,
        attendances
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    // Check if user is admin, faculty, or the student themselves
    if (req.user.role === 'student' && req.user.id !== req.params.studentId) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to view other students\' attendance');
      return res.status(statusCode).json(response);
    }

    // Check if faculty is teaching the student
    let isAuthorized = req.user.role === 'admin' || req.user.id === req.params.studentId;

    if (req.user.role === 'faculty' && !isAuthorized) {
      // Get courses taught by this faculty
      const courses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = courses.map(course => course._id);

      // Check if student is enrolled in any of these courses
      const enrollments = await Enrollment.findOne({
        student: req.params.studentId,
        course: { $in: courseIds },
        status: 'active'
      });

      isAuthorized = !!enrollments;
    }

    if (!isAuthorized) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to view this student\'s attendance');
      return res.status(statusCode).json(response);
    }

    // Build query
    let query = { student: req.params.studentId };

    // Filter by course if provided
    if (req.query.course) {
      query.course = req.query.course;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.date) {
      // For a specific date
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: date,
        $lt: nextDay
      };
    }

    const attendances = await Attendance.find(query)
      .populate('course', 'title code')
      .populate('markedBy', 'name email')
      .sort({ date: -1 }); // Sort by date, newest first

    const { statusCode, response } = apiResponse.success(
      'Student attendance records retrieved successfully',
      {
        count: attendances.length,
        attendances
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records for a specific course
// @route   GET /api/attendance/course/:courseId
// @access  Private/Admin/Faculty
exports.getCourseAttendance = async (req, res, next) => {
  try {
    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      const { statusCode, response } = apiResponse.notFound('Course not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is authorized to view this course's attendance
    const isAdmin = req.user.role === 'admin';
    const isFacultyTeachingCourse = req.user.role === 'faculty' &&
                                  course.instructor &&
                                  course.instructor.toString() === req.user.id;

    // Students can only view their own attendance, which is handled by getStudentAttendance
    if (!isAdmin && !isFacultyTeachingCourse) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to view this course\'s attendance');
      return res.status(statusCode).json(response);
    }

    // Build query
    let query = { course: req.params.courseId };

    // Filter by student if provided
    if (req.query.student) {
      query.student = req.query.student;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.date) {
      // For a specific date
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: date,
        $lt: nextDay
      };
    }

    const attendances = await Attendance.find(query)
      .populate('student', 'name email studentId')
      .populate('markedBy', 'name email')
      .sort({ date: -1 }); // Sort by date, newest first

    const { statusCode, response } = apiResponse.success(
      'Course attendance records retrieved successfully',
      {
        count: attendances.length,
        attendances
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private/Admin/Faculty
exports.createAttendance = async (req, res, next) => {
  try {
    // Validate attendance data
    const { isValid, errors } = validateAttendance(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // Set the faculty who marked the attendance
    req.body.markedBy = req.user.id;

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

    // Check if faculty is authorized to mark attendance for this course
    if (req.user.role === 'faculty') {
      const isFacultyTeachingCourse = courseExists.instructor &&
                                    courseExists.instructor.toString() === req.user.id;

      if (!isFacultyTeachingCourse) {
        const { statusCode, response } = apiResponse.forbidden('Not authorized to mark attendance for this course');
        return res.status(statusCode).json(response);
      }
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.body.student,
      course: req.body.course,
      status: 'active'
    });

    if (!enrollment) {
      const { statusCode, response } = apiResponse.error('Student is not enrolled in this course', 400);
      return res.status(statusCode).json(response);
    }

    // Check if attendance record already exists for this student, course, and date
    const date = new Date(req.body.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const existingAttendance = await Attendance.findOne({
      student: req.body.student,
      course: req.body.course,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingAttendance) {
      const { statusCode, response } = apiResponse.error(
        'Attendance record already exists for this student, course, and date',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Create attendance record
    const attendance = await Attendance.create(req.body);

    const { statusCode, response } = apiResponse.success(
      'Attendance record created successfully',
      { attendance },
      201
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin/Faculty
exports.updateAttendance = async (req, res, next) => {
  try {
    // Validate attendance data if provided
    if (Object.keys(req.body).length > 0) {
      const { isValid, errors } = validateAttendance({
        ...req.body,
        // Include required fields that might not be in the update
        student: req.body.student || 'placeholder',
        course: req.body.course || 'placeholder',
        date: req.body.date || new Date(),
        status: req.body.status || 'present'
      });

      if (!isValid) {
        const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
        return res.status(statusCode).json(response);
      }
    }

    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      const { statusCode, response } = apiResponse.notFound('Attendance record not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is admin or the faculty who marked the attendance
    const isAdmin = req.user.role === 'admin';
    const isFacultyWhoMarked = attendance.markedBy && attendance.markedBy.toString() === req.user.id;

    if (!isAdmin && !isFacultyWhoMarked) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to update this attendance record');
      return res.status(statusCode).json(response);
    }

    // If changing the student or course, verify they exist and are valid
    if (req.body.student) {
      const studentExists = await User.findById(req.body.student);
      if (!studentExists || studentExists.role !== 'student') {
        const { statusCode, response } = apiResponse.error('Student not found or user is not a student', 400);
        return res.status(statusCode).json(response);
      }
    }

    if (req.body.course) {
      const courseExists = await Course.findById(req.body.course);
      if (!courseExists) {
        const { statusCode, response } = apiResponse.error('Course not found', 400);
        return res.status(statusCode).json(response);
      }
    }

    // If changing the date, check for duplicate attendance records
    if (req.body.date) {
      const date = new Date(req.body.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const existingAttendance = await Attendance.findOne({
        _id: { $ne: req.params.id }, // Exclude current record
        student: req.body.student || attendance.student,
        course: req.body.course || attendance.course,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      if (existingAttendance) {
        const { statusCode, response } = apiResponse.error(
          'Attendance record already exists for this student, course, and date',
          400
        );
        return res.status(statusCode).json(response);
      }
    }

    // Update attendance record
    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const { statusCode, response } = apiResponse.success(
      'Attendance record updated successfully',
      { attendance }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
exports.deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      const { statusCode, response } = apiResponse.notFound('Attendance record not found');
      return res.status(statusCode).json(response);
    }

    // Only admin can delete attendance records
    if (req.user.role !== 'admin') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to delete attendance records');
      return res.status(statusCode).json(response);
    }

    await attendance.deleteOne();

    const { statusCode, response } = apiResponse.success('Attendance record deleted successfully');

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
