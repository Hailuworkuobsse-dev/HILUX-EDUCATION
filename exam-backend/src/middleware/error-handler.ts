import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // App-level errors
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
      details: err.details
    });
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
      return res.status(409).json({
        message: `A record with this ${target} already exists`,
        code: 'CONFLICT'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found', code: 'NOT_FOUND' });
    }
  }

  // Zod leaks (should be caught by validate())
  if ((err as { name?: string }).name === 'ZodError') {
    return res.status(400).json({ message: 'Validation failed', code: 'BAD_REQUEST' });
  }

  // Unknown error
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL',
    ...(env.NODE_ENV === 'development' ? { detail: String(err?.message ?? err) } : {})
  });
};
