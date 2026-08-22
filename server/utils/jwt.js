import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rakthalink_default_jwt_secret_dev_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Digitally signs a JWT session token containing user payload.
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Cryptographically verifies an incoming JWT token.
 */
export const verifyToken = (token) => {
  try {
    return {
      valid: true,
      decoded: jwt.verify(token, JWT_SECRET),
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
};
