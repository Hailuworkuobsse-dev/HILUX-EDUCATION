import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { createFlagSchema } from './flags.schemas.js';
import { createFlag } from './flags.service.js';

export const createFlagHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(createFlagSchema, req.body);
  const flag = await createFlag(req.user.id, input);
  res.status(201).json(flag);
};
