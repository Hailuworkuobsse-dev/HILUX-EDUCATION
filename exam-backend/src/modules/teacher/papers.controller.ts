import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import {
  paperFormSchema,
  paperListQuerySchema,
  paperUpdateSchema,
  rejectReasonSchema
} from './schemas.js';
import {
  approvePaper,
  archivePaper,
  createPaper,
  deletePaper,
  getPaper,
  listPapers,
  rejectPaper,
  submitPaperForReview,
  updatePaper
} from './papers.service.js';

export const listPapersHandler: RequestHandler = async (req, res) => {
  const q = validate(paperListQuerySchema, req.query);
  res.json(await listPapers(q));
};

export const getPaperHandler: RequestHandler = async (req, res) => {
  res.json(await getPaper(req.params.paperId));
};

export const createPaperHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(paperFormSchema, req.body);
  const paper = await createPaper(req.user.id, input, getRequestContext(req));
  res.status(201).json(paper);
};

export const updatePaperHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(paperUpdateSchema, req.body);
  const paper = await updatePaper(
    req.user.id,
    req.params.paperId,
    input,
    getRequestContext(req)
  );
  res.json(paper);
};

export const deletePaperHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  await deletePaper(req.user.id, req.params.paperId, getRequestContext(req));
  res.json({ message: 'Paper deleted' });
};

export const submitPaperReviewHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const paper = await submitPaperForReview(req.user.id, req.params.paperId);
  res.json(paper);
};

export const approvePaperHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const paper = await approvePaper(
    req.user.id,
    req.params.paperId,
    getRequestContext(req)
  );
  res.json(paper);
};

export const rejectPaperHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { reason } = validate(rejectReasonSchema, req.body);
  const paper = await rejectPaper(
    req.user.id,
    req.params.paperId,
    reason,
    getRequestContext(req)
  );
  res.json(paper);
};

export const publishPaperHandler: RequestHandler = async (req, res) => {
  // Alias for approve (review → published, cannot be own submission)
  if (!req.user) throw ApiError.unauthorized();
  const paper = await approvePaper(
    req.user.id,
    req.params.paperId,
    getRequestContext(req)
  );
  res.json(paper);
};

export const archivePaperHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const paper = await archivePaper(req.user.id, req.params.paperId);
  res.json(paper);
};
