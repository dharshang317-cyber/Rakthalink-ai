import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Route Protection Middleware
 * Verifies Bearer JWT token from Authorization header and attaches `req.user`.
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Extract Bearer token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please log in with your Google account.');
    }

    // 2. Cryptographically verify token
    const result = verifyToken(token);
    if (!result.valid) {
      return sendError(res, 401, 'Your session has expired or is invalid. Please log in again.');
    }

    // 3. Find user in database
    const user = await User.findById(result.decoded.userId);
    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    // 4. Check account suspension status
    if (user.isBlocked) {
      return sendError(res, 403, 'Your account has been blocked due to policy violations. Contact support.');
    }
    if (user.isDeactivated) {
      return sendError(res, 403, 'Your account is deactivated. Please reactivate your account.');
    }

    // 5. Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]:', error.message);
    return sendError(res, 500, 'Authentication error occurred.');
  }
};

/**
 * Role-Based Authorization Guard Middleware (RBAC)
 * Restricts route access to specified user roles (e.g. 'admin', 'donor', 'requester').
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    // Allow user if role is directly in allowed roles, or if user is 'both' and allowed role is 'donor' or 'requester'
    const userRole = req.user.role;
    const hasRole =
      roles.includes(userRole) ||
      (userRole === 'both' && (roles.includes('donor') || roles.includes('requester')));

    if (!hasRole) {
      return sendError(
        res,
        403,
        `Access denied. Your role '${userRole}' does not have permission to perform this action.`
      );
    }

    next();
  };
};
