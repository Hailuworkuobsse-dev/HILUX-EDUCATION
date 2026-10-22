import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import {
  changeRoleSchema,
  changeStatusSchema,
  listUsersQuerySchema
} from './schemas.js';
import {
  changeRole,
  changeStatus,
  getUser,
  listUsers,
  resetUserPassword
} from './users.service.js';

export const listUsersHandler: RequestHandler = async (req, res) => {
  const query = validate(listUsersQuerySchema, req.query);
  res.json(await listUsers(query));
};

export const getUserHandler: RequestHandler = async (req, res) => {
  res.json(await getUser(req.params.userId));
};

export const changeRoleHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(changeRoleSchema, req.body);
  const updated = await changeRole(
    req.user.id,
    req.params.userId,
    input,
    getRequestContext(req)
  );
  res.json(updated);
};

export const changeStatusHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(changeStatusSchema, req.body);
  const updated = await changeStatus(
    req.user.id,
    req.params.userId,
    input,
    getRequestContext(req)
  );
  res.json(updated);
};

export const resetPasswordHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  await resetUserPassword(req.user.id, req.params.userId, getRequestContext(req));
  res.json({ message: 'Password reset token issued' });
};
