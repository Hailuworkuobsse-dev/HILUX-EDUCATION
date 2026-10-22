import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'exam-prep-backend',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

healthRouter.get(
  '/db',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'up' });
  })
);
