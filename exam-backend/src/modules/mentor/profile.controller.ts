import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { updateProfileSchema } from './schemas.js';
import { getProfile, updateProfile } from './profile.service.js';

export const getProfileHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getProfile(req.user.id));
};

export const updateProfileHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(updateProfileSchema, req.body);
  const profile = await updateProfile(req.user.id, input);
  res.json(profile);
};
