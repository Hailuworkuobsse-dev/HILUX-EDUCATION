import type { ErrorRequestHandler } from 'express';

/**
 * Catches body-parser SyntaxError (malformed JSON) and returns a JSON 400
 * instead of Express's default HTML error page.
 */
export const jsonErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as { status?: number }).status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      message: 'Invalid JSON body',
      code: 'BAD_REQUEST'
    });
  }
  next(err);
};
