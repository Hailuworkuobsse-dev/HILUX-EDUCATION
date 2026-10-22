import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { getOverview } from './overview.service.js';

export const overviewHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getOverview(req.user.id));
};
