import { Router } from 'express';
import { ApiError } from '../../lib/errors.js';

export const teacherRouter = Router();

// Placeholder — implemented in Step 5
teacherRouter.all('*', (_req, _res, next) => {
  next(ApiError.notImplemented('Teacher module — implemented in Step 5'));
});
