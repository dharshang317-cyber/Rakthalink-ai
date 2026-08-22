/**
 * Standardized API Response Helper
 * Enforces uniform REST API JSON response structures across all endpoints.
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'An unexpected error occurred', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
