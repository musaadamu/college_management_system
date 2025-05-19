const { Department } = require('../models');
const { validateDepartment } = require('../validations/departmentValidation');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res, next) => {
  try {
    // Build query with filters
    let query = {};

    // Filter by name if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    // Filter by code if provided
    if (req.query.code) {
      query.code = { $regex: req.query.code, $options: 'i' };
    }

    const departments = await Department.find(query).populate('headOfDepartment', 'name email');

    const { statusCode, response } = apiResponse.success(
      'Departments retrieved successfully',
      {
        count: departments.length,
        departments
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('headOfDepartment', 'name email');

    if (!department) {
      const { statusCode, response } = apiResponse.notFound('Department not found');
      return res.status(statusCode).json(response);
    }

    const { statusCode, response } = apiResponse.success(
      'Department retrieved successfully',
      { department }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
  try {
    // Validate department data
    const { isValid, errors } = validateDepartment(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // Check if department with same code already exists
    const existingDepartment = await Department.findOne({ code: req.body.code });
    if (existingDepartment) {
      const { statusCode, response } = apiResponse.error(
        'Department with this code already exists',
        400
      );
      return res.status(statusCode).json(response);
    }

    const department = await Department.create(req.body);

    const { statusCode, response } = apiResponse.success(
      'Department created successfully',
      { department },
      201
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res, next) => {
  try {
    // Validate department data
    const { isValid, errors } = validateDepartment(req.body);

    if (!isValid) {
      const { statusCode, response } = apiResponse.error('Validation failed', 400, errors);
      return res.status(statusCode).json(response);
    }

    // Check if department exists
    let department = await Department.findById(req.params.id);
    if (!department) {
      const { statusCode, response } = apiResponse.notFound('Department not found');
      return res.status(statusCode).json(response);
    }

    // Check if updating code and if it already exists
    if (req.body.code && req.body.code !== department.code) {
      const existingDepartment = await Department.findOne({ code: req.body.code });
      if (existingDepartment) {
        const { statusCode, response } = apiResponse.error(
          'Department with this code already exists',
          400
        );
        return res.status(statusCode).json(response);
      }
    }

    // Update department
    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const { statusCode, response } = apiResponse.success(
      'Department updated successfully',
      { department }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res, next) => {
  try {
    // Check if department exists
    const department = await Department.findById(req.params.id);

    if (!department) {
      const { statusCode, response } = apiResponse.notFound('Department not found');
      return res.status(statusCode).json(response);
    }

    // Check if department has associated courses
    const Course = require('../models/Course');
    const courses = await Course.countDocuments({ department: req.params.id });

    if (courses > 0) {
      const { statusCode, response } = apiResponse.error(
        `Cannot delete department with ${courses} associated courses`,
        400
      );
      return res.status(statusCode).json(response);
    }

    // Delete department
    await department.deleteOne();

    const { statusCode, response } = apiResponse.success(
      'Department deleted successfully'
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
