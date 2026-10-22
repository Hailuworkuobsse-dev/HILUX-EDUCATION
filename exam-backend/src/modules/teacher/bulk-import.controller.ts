import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { importCsvSchema } from './schemas.js';
import { commitImport, validateImport } from './bulk-import.service.js';

export const validateImportHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { csv } = validate(importCsvSchema, req.body);
  res.json(await validateImport(csv));
};

export const commitImportHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { csv } = validate(importCsvSchema, req.body);
  res.json(await commitImport(req.user.id, csv));
};
