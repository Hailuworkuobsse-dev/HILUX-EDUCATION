import type { RequestHandler } from 'express';
import { ApiError } from '../lib/errors.js';
import type { Role } from '../lib/permission.js';

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role as Role)) {
      return next(ApiError.forbidden(`Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}
