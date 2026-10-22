import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { listMenteesQuerySchema } from './schemas.js';
import { getMentee, listMentees } from './mentees.service.js';

export const listMenteesHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const query = validate(listMenteesQuerySchema, req.query);
  const mentees = await listMentees(req.user.id, query);
  res.json(mentees);
};

export const getMenteeHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const mentee = await getMentee(req.user.id, req.params.menteeId);
  res.json(mentee);
};
