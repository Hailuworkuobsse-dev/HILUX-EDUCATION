import type { Request } from 'express';

export interface RequestContext {
  ip: string | undefined;
  userAgent: string | undefined;
}

export function getRequestContext(req: Request): RequestContext {
  const ip = req.ip ?? req.socket.remoteAddress;
  return {
    ip: ip ? String(ip).slice(0, 64) : undefined,
    userAgent: req.headers['user-agent']?.slice(0, 500)
  };
}
