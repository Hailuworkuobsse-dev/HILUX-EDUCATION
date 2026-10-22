import type { RequestHandler } from 'express';
import { getOverview } from './overview.service.js';

export const overviewHandler: RequestHandler = async (_req, res) => {
  res.json(await getOverview());
};
