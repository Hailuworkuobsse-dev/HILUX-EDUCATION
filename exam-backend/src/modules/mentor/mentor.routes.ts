import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/require-role.js';
import { overviewHandler } from './overview.controller.js';
import {
  listMenteesHandler,
  getMenteeHandler
} from './mentees.controller.js';
import {
  listThreadsHandler,
  getThreadHandler,
  listMessagesHandler,
  sendMessageHandler,
  markThreadReadHandler,
  unreadThreadCountHandler
} from './threads.controller.js';
import {
  listReportsHandler,
  updateReportHandler
} from './reports.controller.js';
import {
  getProfileHandler,
  updateProfileHandler
} from './profile.controller.js';

export const mentorRouter = Router();

mentorRouter.use(authenticate);
mentorRouter.use(requireRole('mentor'));

// ─── Overview ─────────────────────────────────────────────────────────────
mentorRouter.get('/overview', asyncHandler(overviewHandler));

// ─── Mentees ──────────────────────────────────────────────────────────────
mentorRouter.get('/mentees', asyncHandler(listMenteesHandler));
mentorRouter.get('/mentees/:menteeId', asyncHandler(getMenteeHandler));

// ─── Threads ──────────────────────────────────────────────────────────────
// NOTE: `/threads/unread-count` MUST be registered before `/threads/:threadId`
// so the literal segment is not swallowed by the param route.
mentorRouter.get('/threads/unread-count', asyncHandler(unreadThreadCountHandler));
mentorRouter.get('/threads', asyncHandler(listThreadsHandler));
mentorRouter.get('/threads/:threadId', asyncHandler(getThreadHandler));
mentorRouter.get('/threads/:threadId/messages', asyncHandler(listMessagesHandler));
mentorRouter.post('/threads/:threadId/messages', asyncHandler(sendMessageHandler));
mentorRouter.patch('/threads/:threadId/read', asyncHandler(markThreadReadHandler));

// ─── Reports ──────────────────────────────────────────────────────────────
mentorRouter.get('/reports', asyncHandler(listReportsHandler));
mentorRouter.patch('/reports/:reportId', asyncHandler(updateReportHandler));

// ─── Profile ──────────────────────────────────────────────────────────────
mentorRouter.get('/profile', asyncHandler(getProfileHandler));
mentorRouter.patch('/profile', asyncHandler(updateProfileHandler));
