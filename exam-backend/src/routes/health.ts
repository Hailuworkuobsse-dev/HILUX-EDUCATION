import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

/**
 * Liveness: is the process up? No dependencies checked.
 * Used by Docker HEALTHCHECK / K8s livenessProbe.
 */
healthRouter.get('/live', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

/**
 * Readiness: can the process serve traffic? Checks the DB.
 * Used by K8s readinessProbe — 503 keeps the pod out of rotation instead of
 * killing it, which is what you want during a DB blip.
 */
healthRouter.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, db: 'up' });
    } catch {
      res.status(503).json({ ok: false, db: 'down' });
    }
  })
);

/**
 * Full info endpoint (safe — no secrets).
 */
healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'exam-prep-backend',
    env: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Legacy DB endpoint — kept for backwards compatibility.
 */
healthRouter.get(
  '/db',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'up' });
  })
);
