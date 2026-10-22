import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import {
  listMessagesQuerySchema,
  sendMessageSchema
} from './schemas.js';
import {
  getThread,
  listMessages,
  listThreads,
  markThreadRead,
  sendMessage,
  unreadThreadCount
} from './threads.service.js';

export const listThreadsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await listThreads(req.user.id));
};

export const getThreadHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getThread(req.user.id, req.params.threadId));
};

export const listMessagesHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { since } = validate(listMessagesQuerySchema, req.query);
  res.json(await listMessages(req.user.id, req.params.threadId, since));
};

export const sendMessageHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = validate(sendMessageSchema, req.body);
  const message = await sendMessage(req.user.id, req.params.threadId, body);
  res.status(201).json(message);
};

export const markThreadReadHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await markThreadRead(req.user.id, req.params.threadId));
};

export const unreadThreadCountHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const count = await unreadThreadCount(req.user.id);
  res.json({ count });
};
