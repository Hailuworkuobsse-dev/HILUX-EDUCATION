import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] }
  );
}

export function signRefreshToken(userId: string, jti: string): string {
  return jwt.sign(
    { sub: userId, jti, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded !== 'object' || decoded === null || (decoded as { type?: string }).type !== 'access') {
    throw new Error('Invalid access token payload');
  }
  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded !== 'object' || decoded === null || (decoded as { type?: string }).type !== 'refresh') {
    throw new Error('Invalid refresh token payload');
  }
  return decoded as RefreshTokenPayload;
}
