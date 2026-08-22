import rateLimit from 'express-rate-limit';

/**
 * Standard API Rate Limiter
 * Limits general requests to 100 per 15-minute window per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Sensitive Endpoints Rate Limiter
 * Applied to Authentication and AI endpoints to prevent brute-force attacks and API abuse.
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many sensitive requests from this IP. Please try again after 15 minutes.',
  },
});
