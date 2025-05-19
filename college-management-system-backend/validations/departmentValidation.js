/**
 * Validate department data
 * @param {Object} data - Department data to validate
 * @returns {Object} Validation result with errors if any
 */
exports.validateDepartment = (data) => {
  const errors = {};

  // Validate name
  if (!data.name) {
    errors.name = 'Department name is required';
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.name = 'Department name must be between 2 and 100 characters';
  }

  // Validate code
  if (!data.code) {
    errors.code = 'Department code is required';
  } else if (!/^[A-Z0-9]{2,10}$/.test(data.code)) {
    errors.code = 'Department code must be 2-10 uppercase letters or numbers';
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
