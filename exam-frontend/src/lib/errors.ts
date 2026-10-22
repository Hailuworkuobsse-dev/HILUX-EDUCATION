import { ApiError } from './api';

/**
 * Extract a user-facing error message from any thrown value.
 * Falls back to `fallback` when the value isn't recognizable.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err;
  return fallback;
}

/**
 * Field-level error map from an ApiError's `details` (matches Zod shape).
 */
export function getFieldErrors(err: unknown): Record<string, string[]> {
  if (!(err instanceof ApiError)) return {};
  const details = err.details;
  if (!details || typeof details !== 'object') return {};
  return details as Record<string, string[]>;
}
