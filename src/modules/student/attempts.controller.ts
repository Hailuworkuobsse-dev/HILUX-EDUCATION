import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import {
  listAttemptsQuerySchema,
  saveAnswerSchema,
  startAttemptSchema
} from './attempts.schemas.js';
import {
  getAttempt,
  getAttemptResult,
  listAttempts,
  saveAnswer,
  startAttempt,
  submitAttempt
} from './attempts.service.js';

export const startAttemptHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(startAttemptSchema, req.body);
  const attempt = await startAttempt(req.user.id, input);
  res.status(201).json(attempt);
};

export const listAttemptsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const query = validate(listAttemptsQuerySchema, req.query);
  const attempts = await listAttempts(req.user.id, query);
  res.json(attempts);
};

export const getAttemptHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const attempt = await getAttempt(req.user.id, req.params.attemptId);
  res.json(attempt);
};

export const saveAnswerHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(saveAnswerSchema, req.body);
  const result = await saveAnswer(
    req.user.id,
    req.params.attemptId,
    req.params.questionId,
    input.selectedOptionId
  );
  res.json(result);
};

export const submitAttemptHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await submitAttempt(req.user.id, req.params.attemptId);
  res.json(result);
};

export const getAttemptResultHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await getAttemptResult(req.user.id, req.params.attemptId);
  res.json(result);
};
