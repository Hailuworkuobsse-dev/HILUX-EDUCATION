import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate } from '../../middleware/auth.js';
import {
  listCoursesHandler,
  getCourseHandler,
  enrollHandler
} from './courses.controller.js';
import {
  listSubjectsHandler,
  listTopicsHandler
} from './taxonomy.controller.js';
import {
  startAttemptHandler,
  listAttemptsHandler,
  getAttemptHandler,
  saveAnswerHandler,
  submitAttemptHandler,
  getAttemptResultHandler
} from './attempts.controller.js';
import {
  overviewHandler,
  topicAccuracyHandler,
  progressHandler,
  dueReviewsHandler
} from './analytics.controller.js';
import { listPapersHandler } from './papers.controller.js';
import { createFlagHandler } from './flags.controller.js';

export const contentRouter = Router();

contentRouter.use(authenticate);

contentRouter.get('/subjects', asyncHandler(listSubjectsHandler));
contentRouter.get('/topics', asyncHandler(listTopicsHandler));

contentRouter.get('/courses', asyncHandler(listCoursesHandler));
contentRouter.get('/courses/:subjectId', asyncHandler(getCourseHandler));
contentRouter.post('/enrollments', asyncHandler(enrollHandler));

contentRouter.get('/papers', asyncHandler(listPapersHandler));

contentRouter.post('/attempts', asyncHandler(startAttemptHandler));
contentRouter.get('/attempts', asyncHandler(listAttemptsHandler));
contentRouter.get('/attempts/:attemptId', asyncHandler(getAttemptHandler));
contentRouter.patch(
  '/attempts/:attemptId/answers/:questionId',
  asyncHandler(saveAnswerHandler)
);
contentRouter.post(
  '/attempts/:attemptId/submit',
  asyncHandler(submitAttemptHandler)
);
contentRouter.get(
  '/attempts/:attemptId/result',
  asyncHandler(getAttemptResultHandler)
);

contentRouter.get('/analytics/me/overview', asyncHandler(overviewHandler));
contentRouter.get('/analytics/me/topics', asyncHandler(topicAccuracyHandler));
contentRouter.get('/analytics/me/progress', asyncHandler(progressHandler));
contentRouter.get('/analytics/me/due-reviews', asyncHandler(dueReviewsHandler));

// ─── Content flags (student / mentor reports) ────────────────────────────
contentRouter.post('/flags', asyncHandler(createFlagHandler));
