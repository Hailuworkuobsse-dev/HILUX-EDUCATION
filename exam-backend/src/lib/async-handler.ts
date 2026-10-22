import type { RequestHandler } from 'express';

/**
 * Wrap an async route handler so thrown errors are forwarded to Express.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
