import { createHash, randomBytes } from 'node:crypto';

/** SHA-256 hex digest. Used to store opaque tokens in the DB. */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Cryptographically random URL-safe token (64 hex chars). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}
