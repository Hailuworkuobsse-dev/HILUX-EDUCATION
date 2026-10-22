import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate } from '../../middleware/auth.js';
import {
  changePasswordHandler,
  deleteAccountHandler,
  downloadExportHandler,
  getPreferencesHandler,
  requestExportHandler,
  updatePreferencesHandler
} from './account.controller.js';

export const accountRouter = Router();

// ─── Public (token-based) ─────────────────────────────────────────────────
// Mounted before authenticate(): the browser opens this URL directly, so it is
// authorized by the signed 5-minute export token instead of a session.
accountRouter.get('/export/download', asyncHandler(downloadExportHandler));

// ─── Authenticated ────────────────────────────────────────────────────────
accountRouter.use(authenticate);
accountRouter.get('/preferences', asyncHandler(getPreferencesHandler));
accountRouter.patch('/preferences', asyncHandler(updatePreferencesHandler));
accountRouter.post('/password', asyncHandler(changePasswordHandler));
accountRouter.post('/export', asyncHandler(requestExportHandler));
accountRouter.post('/delete-account', asyncHandler(deleteAccountHandler));
