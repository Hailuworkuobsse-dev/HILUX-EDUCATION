import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { ApiError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

/**
 * Requires a valid `Authorization: Bearer <token>` header.
 * Attaches the full User row to `req.user`.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }
    const token = header.slice(7).trim();
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (user.status === 'suspended') throw ApiError.forbidden('Account suspended');

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

/**
 * Attaches `req.user` when a valid token is present, but does not error otherwise.
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    const token = header.slice(7).trim();
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user && user.status !== 'suspended') req.user = user;
  } catch {
    /* ignore — treat as anonymous */
  }
  next();
};
