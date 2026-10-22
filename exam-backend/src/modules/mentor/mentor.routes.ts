import { Router } from 'express';
import { ApiError } from '../../lib/errors.js';

export const mentorRouter = Router();

// Placeholder — implemented in Step 4
mentorRouter.all('*', (_req, _res, next) => {
  next(ApiError.notImplemented('Mentor module — implemented in Step 4'));
});
