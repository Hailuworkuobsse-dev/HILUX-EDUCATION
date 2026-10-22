import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import {
  getReviewQueuePapers,
  getReviewQueueQuestions
} from './review.service.js';

export const reviewQueueQuestionsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getReviewQueueQuestions(req.user.id));
};

export const reviewQueuePapersHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getReviewQueuePapers(req.user.id));
};
