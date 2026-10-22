import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import {
  changePasswordSchema,
  deleteAccountSchema,
  downloadExportSchema,
  updatePreferencesSchema
} from './schemas.js';
import {
  buildExportBundle,
  changePassword,
  deleteAccount,
  getPreferences,
  requestExport,
  updatePreferences
} from './account.service.js';

export const getPreferencesHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getPreferences(req.user.id));
};

export const updatePreferencesHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(updatePreferencesSchema, req.body);
  const prefs = await updatePreferences(req.user.id, input, getRequestContext(req));
  res.json(prefs);
};

export const changePasswordHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(changePasswordSchema, req.body);
  await changePassword(req.user, input, getRequestContext(req));
  res.json({ message: 'Password updated. Please sign in again.' });
};

export const requestExportHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const job = await requestExport(req.user, getRequestContext(req));
  res.json(job);
};

// Public: authorized by the short-lived signed token in the query string.
export const downloadExportHandler: RequestHandler = async (req, res) => {
  const { token } = validate(downloadExportSchema, req.query);
  const { data } = await buildExportBundle(token);

  const json = JSON.stringify(data, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="examprep-export-${Date.now()}.json"`
  );
  res.send(json);
};

export const deleteAccountHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(deleteAccountSchema, req.body);
  await deleteAccount(req.user, input, getRequestContext(req));
  res.json({ message: 'Account deleted' });
};
