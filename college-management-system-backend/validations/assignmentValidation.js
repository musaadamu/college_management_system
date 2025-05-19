/**
 * Validate assignment data
 * @param {Object} data - Assignment data to validate
 * @returns {Object} Validation result with errors if any
 */
exports.validateAssignment = (data) => {
  const errors = {};

  // Validate title
  if (!data.title) {
    errors.title = 'Assignment title is required';
  } else if (data.title.length < 3) {
    errors.title = 'Assignment title must be at least 3 characters';
  } else if (data.title.length > 100) {
    errors.title = 'Assignment title cannot exceed 100 characters';
  }

  // Validate description
  if (!data.description) {
    errors.description = 'Assignment description is required';
  } else if (data.description.length < 10) {
    errors.description = 'Assignment description must be at least 10 characters';
  }

  // Validate course
  if (!data.course) {
    errors.course = 'Course is required';
  }

  // Validate dueDate
  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  } else {
    const dueDate = new Date(data.dueDate);
    const now = new Date();
    
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = 'Invalid due date format';
    } else if (dueDate < now && data.status === 'published') {
      errors.dueDate = 'Due date cannot be in the past for published assignments';
    }
  }

  // Validate points
  if (data.points === undefined || data.points === null) {
    errors.points = 'Points are required';
  } else if (isNaN(Number(data.points))) {
    errors.points = 'Points must be a number';
  } else if (Number(data.points) < 0) {
    errors.points = 'Points cannot be negative';
  }

  // Validate createdBy
  if (!data.createdBy) {
    errors.createdBy = 'User who created the assignment is required';
  }

  // Validate status
  if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
    errors.status = 'Status must be draft, published, or archived';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate submission data
 * @param {Object} data - Submission data to validate
 * @returns {Object} Validation result with errors if any
 */
exports.validateSubmission = (data) => {
  const errors = {};

  // Validate student
  if (!data.student) {
    errors.student = 'Student is required';
  }

  // Validate files
  if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
    errors.files = 'At least one file is required';
  }

  // Validate grade (if provided)
  if (data.grade !== undefined && data.grade !== null) {
    if (isNaN(Number(data.grade))) {
      errors.grade = 'Grade must be a number';
    } else if (Number(data.grade) < 0) {
      errors.grade = 'Grade cannot be negative';
    }
  }

  // Validate status
  if (data.status && !['submitted', 'graded', 'late', 'missing'].includes(data.status)) {
    errors.status = 'Status must be submitted, graded, late, or missing';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
