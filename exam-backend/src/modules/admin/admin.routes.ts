import { Router } from 'express';
import { ApiError } from '../../lib/errors.js';

export const adminRouter = Router();

// Placeholder — implemented in Step 6
adminRouter.all('*', (_req, _res, next) => {
  next(ApiError.notImplemented('Admin module — implemented in Step 6'));
});
