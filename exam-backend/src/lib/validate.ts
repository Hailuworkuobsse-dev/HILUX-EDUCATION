import { ZodError, type ZodTypeAny, type infer as ZodInfer } from 'zod';
import { ApiError } from './errors.js';

/**
 * Parse `data` with `schema` and map Zod issues onto a `400 ApiError`.
 *
 * The return type is the schema's **output** type (`z.infer`), so any
 * `.default()` / `.transform()` the schema applies is reflected in what the
 * caller receives (e.g. `language` is `string`, not `string | undefined`).
 */
export function validate<S extends ZodTypeAny>(schema: S, data: unknown): ZodInfer<S> {
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
