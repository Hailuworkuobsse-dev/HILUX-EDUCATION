import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import { listFlagsQuerySchema, resolveFlagSchema } from './schemas.js';
import { listFlags, resolveFlag } from './content.service.js';

export const listFlagsHandler: RequestHandler = async (req, res) => {
  const query = validate(listFlagsQuerySchema, req.query);
  res.json(await listFlags(query.status));
};

export const resolveFlagHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(resolveFlagSchema, req.body);
  const flag = await resolveFlag(
    req.user.id,
    req.params.flagId,
    input,
    getRequestContext(req)
  );
  res.json(flag);
};
