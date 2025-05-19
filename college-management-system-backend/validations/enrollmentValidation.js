/**
 * Validate enrollment data
 * @param {Object} data - Enrollment data to validate
 * @returns {Object} Validation result with errors if any
 */
exports.validateEnrollment = (data) => {
  const errors = {};

  // Validate student
  if (!data.student) {
    errors.student = 'Student is required';
  }

  // Validate course
  if (!data.course) {
    errors.course = 'Course is required';
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

  // Validate status if provided
  if (data.status && !['active', 'dropped', 'completed'].includes(data.status)) {
    errors.status = 'Status must be active, dropped, or completed';
  }

  // Validate grade if provided
  if (data.grade && !['A', 'B', 'C', 'D', 'F', 'I', 'W', ''].includes(data.grade)) {
    errors.grade = 'Grade must be A, B, C, D, F, I, W, or empty';
  }

  // Validate gradePoints if provided
  if (data.gradePoints !== undefined) {
    if (isNaN(data.gradePoints) || data.gradePoints < 0 || data.gradePoints > 4) {
      errors.gradePoints = 'Grade points must be between 0 and 4';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
