/**
 * Validate file data
 * @param {Object} data - File data to validate
 * @returns {Object} Validation result with errors if any
 */
exports.validateFile = (data) => {
  const errors = {};

  // Validate name
  if (!data.name) {
    errors.name = 'File name is required';
  } else if (data.name.length > 255) {
    errors.name = 'File name cannot exceed 255 characters';
  }

  // Validate originalName
  if (!data.originalName) {
    errors.originalName = 'Original file name is required';
  }

  // Validate mimeType
  if (!data.mimeType) {
    errors.mimeType = 'File type is required';
  }

  // Validate size
  if (!data.size) {
    errors.size = 'File size is required';
  } else if (data.size <= 0) {
    errors.size = 'File size must be greater than 0';
  } else if (data.size > 10 * 1024 * 1024) { // 10MB limit
    errors.size = 'File size cannot exceed 10MB';
  }

  // Validate path
  if (!data.path) {
    errors.path = 'File path is required';
  }

  // Validate url
  if (!data.url) {
    errors.url = 'File URL is required';
  }

  // Validate uploadedBy
  if (!data.uploadedBy) {
    errors.uploadedBy = 'User who uploaded the file is required';
  }

  // Validate fileType
  if (!data.fileType) {
    errors.fileType = 'File type is required';
  } else if (!['resource', 'assignment', 'submission', 'message', 'profile'].includes(data.fileType)) {
    errors.fileType = 'File type must be resource, assignment, submission, message, or profile';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
