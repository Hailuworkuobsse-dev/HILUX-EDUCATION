import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { listReportsQuerySchema, updateReportSchema } from './schemas.js';
import { listReports, updateReportStatus } from './reports.service.js';

export const listReportsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { status } = validate(listReportsQuerySchema, req.query);
  res.json(await listReports(req.user.id, status));
};

export const updateReportHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { status } = validate(updateReportSchema, req.body);
  const report = await updateReportStatus(req.user.id, req.params.reportId, status);
  res.json(report);
};
