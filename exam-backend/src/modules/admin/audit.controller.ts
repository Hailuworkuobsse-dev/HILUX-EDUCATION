import type { RequestHandler } from 'express';
import { validate } from '../../lib/validate.js';
import { listAuditQuerySchema } from './schemas.js';
import { listAudit } from './audit.service.js';

export const listAuditHandler: RequestHandler = async (req, res) => {
  const query = validate(listAuditQuerySchema, req.query);
  res.json(await listAudit(query));
};
