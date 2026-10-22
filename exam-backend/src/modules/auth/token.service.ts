import type { User } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { ApiError } from '../../lib/errors.js';
import { sha256 } from '../../lib/crypto.js';
import { durationToMs, durationToSeconds } from '../../lib/duration.js';
import { getRequestContext } from '../../lib/http.js';
import type { Request } from 'express';
import { toAuthUser, type AuthUserDTO } from './auth.mappers.js';

export interface AuthSessionDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserDTO;
}

export interface IssueSessionContext {
  ip?: string;
  userAgent?: string;
}

/**
 * Issue a fresh access + refresh pair for a user, persisting the refresh
 * token hash so it can be revoked on logout / password change.
 */
export async function issueSession(
  user: User,
  ctx: IssueSessionContext
): Promise<AuthSessionDTO> {
  const jti = sha256(`${user.id}:${Date.now()}:${Math.random()}`).slice(0, 32);
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, jti);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN)),
      ip: ctx.ip?.slice(0, 64) ?? null,
      userAgent: ctx.userAgent?.slice(0, 500) ?? null
    }
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: durationToSeconds(env.JWT_ACCESS_EXPIRES_IN),
    user: toAuthUser(user)
  };
}

/**
 * Rotate a refresh token:
 *  - verifies the JWT signature and `type: refresh`
 *  - looks up the hashed token in the DB
 *  - rejects if missing / revoked / expired
 *  - revokes the old token (one-time use)
 *  - issues a brand new pair
 */
export async function rotateRefreshToken(
  rawToken: string,
  ctx: IssueSessionContext
): Promise<AuthSessionDTO> {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const tokenHash = sha256(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored) throw ApiError.unauthorized('Refresh token not recognised');
  if (stored.revokedAt) throw ApiError.unauthorized('Refresh token has been revoked');
  if (stored.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthorized('Refresh token has expired');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.status === 'suspended') throw ApiError.forbidden('Account suspended');

  // Rotate: revoke old, then issue new (not in a transaction, but revoke is
  // idempotent — a second call after a crash would still be denied because
  // the row is marked revoked).
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() }
  });

  return issueSession(user, ctx);
}

export async function revokeAllForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

/** Convenience helper for controllers. */
export function ctxFromRequest(req: Request): IssueSessionContext {
  const { ip, userAgent } = getRequestContext(req);
  return { ip, userAgent };
}
