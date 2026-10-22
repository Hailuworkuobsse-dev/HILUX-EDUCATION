import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import {
  getDueReviews,
  getOverview,
  getProgress,
  getTopicAccuracy
} from './analytics.service.js';

export const overviewHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getOverview(req.user.id));
};

export const topicAccuracyHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getTopicAccuracy(req.user.id));
};

export const progressHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getProgress(req.user.id));
};

export const dueReviewsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getDueReviews(req.user.id));
};
