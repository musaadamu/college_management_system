/**
 * Validate attendance data
 * @param {Object} data - Attendance data to validate
 * @returns {Object} Validation result with errors if any
 */
exports.validateAttendance = (data) => {
  const errors = {};

  // Validate student
  if (!data.student) {
    errors.student = 'Student is required';
  }

  // Validate course
  if (!data.course) {
    errors.course = 'Course is required';
  }

  // Validate date
  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/;
    if (!dateRegex.test(data.date) && !(data.date instanceof Date)) {
      errors.date = 'Date must be in ISO format (YYYY-MM-DD)';
    }
  }

  // Validate status
  if (!data.status) {
    errors.status = 'Status is required';
  } else if (!['present', 'absent', 'late', 'excused'].includes(data.status)) {
    errors.status = 'Status must be present, absent, late, or excused';
  }

  // Validate remarks (optional)
  if (data.remarks && data.remarks.length > 500) {
    errors.remarks = 'Remarks cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
