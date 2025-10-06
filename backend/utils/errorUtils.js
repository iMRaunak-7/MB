/**
 * Error handling utilities for the backend
 */

/**
 * Custom error class with status code and additional details
 */
class AppError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Indicates this is a known operational error
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format an error for sending to client
 * Sanitizes the error to prevent leaking sensitive information
 * 
 * @param {Error} err - The error object
 * @param {boolean} includeStack - Whether to include stack trace (default: false)
 * @returns {Object} Formatted error object
 */
const formatError = (err, includeStack = false) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Base error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.statusCode || 500
    }
  };
  
  // Add stack trace in development or if explicitly requested
  if ((isDev || includeStack) && err.stack) {
    errorResponse.error.stack = err.stack;
  }
  
  // Add validation errors or other details if available
  if (err.details && Object.keys(err.details).length > 0) {
    errorResponse.error.details = err.details;
  }
  
  return errorResponse;
};

/**
 * Log an error with appropriate level of detail
 * 
 * @param {Error} err - The error to log
 */
const logError = (err) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.error('\x1b[31m%s\x1b[0m', '🚨 ERROR:', err);
  } else {
    // In production, we might want to be more careful about what we log
    const errorInfo = {
      message: err.message,
      path: err.path || '',
      timestamp: new Date().toISOString(),
      statusCode: err.statusCode || 500
    };
    console.error('🚨 ERROR:', JSON.stringify(errorInfo));
  }
};

/**
 * Catch async errors in route handlers
 * 
 * @param {Function} fn - The async route handler function
 * @returns {Function} Wrapped function that catches errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {
  AppError,
  formatError,
  logError,
  catchAsync
};