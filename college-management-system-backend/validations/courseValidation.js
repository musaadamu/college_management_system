/**
 * Validate course data
 * @param {Object} data - Course data to validate
 * @returns {Object} Validation result with errors if any
 */
exports.validateCourse = (data) => {
  const errors = {};

  // Validate title
  if (!data.title) {
    errors.title = 'Course title is required';
  } else if (data.title.length < 3 || data.title.length > 100) {
    errors.title = 'Course title must be between 3 and 100 characters';
  }

  // Validate code
  if (!data.code) {
    errors.code = 'Course code is required';
  } else if (!/^[A-Z0-9]{2,10}$/.test(data.code)) {
    errors.code = 'Course code must be 2-10 uppercase letters or numbers';
  }

  // Validate credits
  if (!data.credits) {
    errors.credits = 'Credits are required';
  } else if (isNaN(data.credits) || data.credits < 1 || data.credits > 6) {
    errors.credits = 'Credits must be a number between 1 and 6';
  }

  // Validate department
  if (!data.department) {
    errors.department = 'Department is required';
  }

  // Validate semester
  if (!data.semester) {
    errors.semester = 'Semester is required';
  } else if (!['Fall', 'Spring', 'Summer'].includes(data.semester)) {
    errors.semester = 'Semester must be Fall, Spring, or Summer';
  }

  // Validate year
  if (!data.year) {
    errors.year = 'Year is required';
  } else {
    const currentYear = new Date().getFullYear();
    if (isNaN(data.year) || data.year < currentYear - 1 || data.year > currentYear + 2) {
      errors.year = `Year must be between ${currentYear - 1} and ${currentYear + 2}`;
    }
  }

  // Validate description (optional)
  if (data.description && data.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
