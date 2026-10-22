import type { RequestHandler } from 'express';
import { ApiError } from '../lib/errors.js';
import { hasPermission, type Permission, type Role } from '../lib/permission.js';

export function requirePermission(...permissions: Permission[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    const role = req.user.role as Role;
    const missing = permissions.filter((p) => !hasPermission(role, p));
    if (missing.length > 0) {
      return next(ApiError.forbidden(`Missing permission: ${missing.join(', ')}`));
    }
    next();
  };
}
