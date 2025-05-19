/**
 * Validate user data
 * @param {Object} data - User data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with errors if any
 */
exports.validateUser = (data, isUpdate = false) => {
  const errors = {};

  // Validate name
  if (!isUpdate || data.name !== undefined) {
    if (!data.name) {
      errors.name = 'Name is required';
    } else if (data.name.length < 2 || data.name.length > 50) {
      errors.name = 'Name must be between 2 and 50 characters';
    }
  }

  // Validate email
  if (!isUpdate || data.email !== undefined) {
    if (!data.email) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Please provide a valid email';
      }
    }
  }

  // Validate password (not required for updates)
  if (!isUpdate || data.password !== undefined) {
    if (!isUpdate && !data.password) {
      errors.password = 'Password is required';
    } else if (data.password && data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
  }

  // Validate role
  if (!isUpdate || data.role !== undefined) {
    if (!data.role) {
      errors.role = 'Role is required';
    } else if (!['admin', 'faculty', 'student'].includes(data.role)) {
      errors.role = 'Role must be admin, faculty, or student';
    }
  }

  // Validate studentId (only required for students)
  if (data.role === 'student' && (!isUpdate || data.studentId !== undefined)) {
    if (!data.studentId) {
      errors.studentId = 'Student ID is required for students';
    } else if (!/^[A-Z0-9]{5,10}$/.test(data.studentId)) {
      errors.studentId = 'Student ID must be 5-10 uppercase letters or numbers';
    }
  }

  // Validate facultyId (only required for faculty)
  if (data.role === 'faculty' && (!isUpdate || data.facultyId !== undefined)) {
    if (!data.facultyId) {
      errors.facultyId = 'Faculty ID is required for faculty';
    } else if (!/^[A-Z0-9]{5,10}$/.test(data.facultyId)) {
      errors.facultyId = 'Faculty ID must be 5-10 uppercase letters or numbers';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
