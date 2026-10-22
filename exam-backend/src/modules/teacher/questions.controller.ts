import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import {
  questionFormSchema,
  questionListQuerySchema,
  questionReviewSchema
} from './schemas.js';
import {
  archiveQuestion,
  createQuestion,
  deleteQuestion,
  getQuestion,
  listQuestions,
  reviewQuestion,
  submitQuestionForReview,
  updateQuestion
} from './questions.service.js';

export const listQuestionsHandler: RequestHandler = async (req, res) => {
  const query = validate(questionListQuerySchema, req.query);
  res.json(await listQuestions(query));
};

export const getQuestionHandler: RequestHandler = async (req, res) => {
  res.json(await getQuestion(req.params.questionId));
};

export const createQuestionHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(questionFormSchema, req.body);
  const question = await createQuestion(
    req.user.id,
    input,
    getRequestContext(req)
  );
  res.status(201).json(question);
};

export const updateQuestionHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(questionFormSchema, req.body);
  const question = await updateQuestion(
    req.user.id,
    req.params.questionId,
    input,
    getRequestContext(req)
  );
  res.json(question);
};

export const deleteQuestionHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  await deleteQuestion(req.user.id, req.params.questionId, getRequestContext(req));
  res.json({ message: 'Question deleted' });
};

export const submitQuestionReviewHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const question = await submitQuestionForReview(req.user.id, req.params.questionId);
  res.json(question);
};

export const reviewQuestionHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { decision, reason } = validate(questionReviewSchema, req.body);
  const question = await reviewQuestion(
    req.user.id,
    req.params.questionId,
    decision,
    reason,
    getRequestContext(req)
  );
  res.json(question);
};

export const publishQuestionHandler: RequestHandler = async (req, res) => {
  // Alias for approve (review → published, cannot be own submission)
  if (!req.user) throw ApiError.unauthorized();
  const question = await reviewQuestion(
    req.user.id,
    req.params.questionId,
    'approve',
    undefined,
    getRequestContext(req)
  );
  res.json(question);
};

export const archiveQuestionHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const question = await archiveQuestion(req.user.id, req.params.questionId);
  res.json(question);
};
