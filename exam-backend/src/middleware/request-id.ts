import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Attach a unique request ID to every request. Honors an incoming
 * `X-Request-Id` header (useful behind API gateways), otherwise generates one.
 * The ID is reflected back in the `X-Request-Id` response header.
 */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  req.id =
    typeof incoming === 'string' && incoming.length > 0
      ? incoming.slice(0, 128)
      : randomUUID();

  res.setHeader('X-Request-Id', req.id);
  next();
};
