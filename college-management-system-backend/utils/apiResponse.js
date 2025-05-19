/**
 * Standard API response format
 * @param {boolean} success - Whether the request was successful
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @returns {Object} Formatted response object
 */
const apiResponse = (success, statusCode, message, data = null) => {
  const response = {
    success,
    message,
  };

  if (data) {
    response.data = data;
  }

  return { statusCode, response };
};

/**
 * Success response
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Success response object
 */
exports.success = (message, data = null, statusCode = 200) => {
  return apiResponse(true, statusCode, message, data);
};

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} data - Additional error data
 * @returns {Object} Error response object
 */
exports.error = (message, statusCode = 400, data = null) => {
  return apiResponse(false, statusCode, message, data);
};

/**
 * Not found response
 * @param {string} message - Not found message
 * @returns {Object} Not found response object
 */
exports.notFound = (message = 'Resource not found') => {
  return apiResponse(false, 404, message);
};

/**
 * Unauthorized response
 * @param {string} message - Unauthorized message
 * @returns {Object} Unauthorized response object
 */
exports.unauthorized = (message = 'Unauthorized access') => {
  return apiResponse(false, 401, message);
};

/**
 * Forbidden response
 * @param {string} message - Forbidden message
 * @returns {Object} Forbidden response object
 */
exports.forbidden = (message = 'Forbidden access') => {
  return apiResponse(false, 403, message);
};

/**
 * Server error response
 * @param {string} message - Server error message
 * @returns {Object} Server error response object
 */
exports.serverError = (message = 'Internal server error') => {
  return apiResponse(false, 500, message);
};
