import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/require-role.js';

import { overviewHandler } from './overview.controller.js';
import {
  approvePaperHandler,
  archivePaperHandler,
  createPaperHandler,
  deletePaperHandler,
  getPaperHandler,
  listPapersHandler,
  publishPaperHandler,
  rejectPaperHandler,
  submitPaperReviewHandler,
  updatePaperHandler
} from './papers.controller.js';
import {
  archiveQuestionHandler,
  createQuestionHandler,
  deleteQuestionHandler,
  getQuestionHandler,
  listQuestionsHandler,
  publishQuestionHandler,
  reviewQuestionHandler,
  submitQuestionReviewHandler,
  updateQuestionHandler
} from './questions.controller.js';
import {
  reviewQueuePapersHandler,
  reviewQueueQuestionsHandler
} from './review.controller.js';
import {
  commitImportHandler,
  validateImportHandler
} from './bulk-import.controller.js';

export const teacherRouter = Router();

teacherRouter.use(authenticate);
teacherRouter.use(requireRole('teacher', 'admin'));

// ─── Overview ─────────────────────────────────────────────────────────────
teacherRouter.get('/overview', asyncHandler(overviewHandler));

// ─── Bulk import (before /questions/:questionId to avoid param capture) ──
teacherRouter.post(
  '/questions/import/validate',
  asyncHandler(validateImportHandler)
);
teacherRouter.post('/questions/import', asyncHandler(commitImportHandler));

// ─── Review queue ─────────────────────────────────────────────────────────
teacherRouter.get(
  '/review-queue/questions',
  asyncHandler(reviewQueueQuestionsHandler)
);
teacherRouter.get('/review-queue/papers', asyncHandler(reviewQueuePapersHandler));

// ─── Papers ───────────────────────────────────────────────────────────────
teacherRouter.get('/papers', asyncHandler(listPapersHandler));
teacherRouter.post('/papers', asyncHandler(createPaperHandler));
teacherRouter.get('/papers/:paperId', asyncHandler(getPaperHandler));
teacherRouter.patch('/papers/:paperId', asyncHandler(updatePaperHandler));
teacherRouter.delete('/papers/:paperId', asyncHandler(deletePaperHandler));
teacherRouter.post(
  '/papers/:paperId/submit-review',
  asyncHandler(submitPaperReviewHandler)
);
teacherRouter.post('/papers/:paperId/approve', asyncHandler(approvePaperHandler));
teacherRouter.post('/papers/:paperId/reject', asyncHandler(rejectPaperHandler));
teacherRouter.post('/papers/:paperId/publish', asyncHandler(publishPaperHandler));
teacherRouter.post('/papers/:paperId/archive', asyncHandler(archivePaperHandler));

// ─── Questions ────────────────────────────────────────────────────────────
teacherRouter.get('/questions', asyncHandler(listQuestionsHandler));
teacherRouter.post('/questions', asyncHandler(createQuestionHandler));
teacherRouter.get('/questions/:questionId', asyncHandler(getQuestionHandler));
teacherRouter.patch('/questions/:questionId', asyncHandler(updateQuestionHandler));
teacherRouter.delete('/questions/:questionId', asyncHandler(deleteQuestionHandler));
teacherRouter.post(
  '/questions/:questionId/submit-review',
  asyncHandler(submitQuestionReviewHandler)
);
teacherRouter.post(
  '/questions/:questionId/review',
  asyncHandler(reviewQuestionHandler)
);
teacherRouter.post(
  '/questions/:questionId/publish',
  asyncHandler(publishQuestionHandler)
);
teacherRouter.post(
  '/questions/:questionId/archive',
  asyncHandler(archiveQuestionHandler)
);
