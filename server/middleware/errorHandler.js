import { sendError } from '../utils/apiResponse.js';

/**
 * 404 Not Found Middleware
 * Intercepts requests for endpoints that do not exist.
 */
export const notFoundHandler = (req, res, next) => {
  const message = `Resource not found: ${req.method} ${req.originalUrl}`;
  return sendError(res, 404, message);
};

/**
 * Centralized Global Error Handler Middleware
 * Catches all uncaught exceptions, validation failures, and asynchronous errors.
 */
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose Duplicate Key Errors (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'. It must be unique.`;
  }

  // Handle JWT Malformed / Expired Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  // Log full error stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}: ${message}`);
  }

  return sendError(res, statusCode, message, errors);
};
