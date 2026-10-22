import rateLimit from 'express-rate-limit';

/**
 * Stricter limiter for sensitive auth endpoints (login, register, OTP,
 * password reset). 10 attempts / 15 min per IP.
 *
 * The global /api limiter (300/min) still applies on top.
 */
export const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many attempts. Please try again later.',
    code: 'TOO_MANY_REQUESTS'
  }
});

/**
 * Moderately strict limiter for refresh/me endpoints. These are called on
 * app bootstrap, so they get a bit more headroom than the login attempts.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please try again later.',
    code: 'TOO_MANY_REQUESTS'
  }
});
