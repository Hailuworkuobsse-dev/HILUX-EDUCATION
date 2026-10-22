import { ZodError, type ZodSchema } from 'zod';
import { ApiError } from './errors.js';

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors = err.flatten().fieldErrors;
      const firstField = Object.keys(fieldErrors)[0];
      const firstMessage = firstField ? fieldErrors[firstField]?.[0] : undefined;
      throw ApiError.badRequest(firstMessage ?? 'Validation failed', fieldErrors);
    }
    throw err;
  }
}
