import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';

export function createApp() {
  const app = express();

  // Trust proxies in production (for correct rate-limit IPs)
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

  // ─── Security & parsing ────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ─── Request logging ───────────────────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.debug(
        {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          ms: Date.now() - start
        },
        'request'
      );
    });
    next();
  });

  // ─── Rate limiting on /api ─────────────────────────────────────────────
  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { message: 'Too many requests', code: 'TOO_MANY_REQUESTS' }
    })
  );

  // ─── Routes ────────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ─── Fallbacks ─────────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
