export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Not found'): ApiError {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  static conflict(message: string): ApiError {
    return new ApiError(409, message, 'CONFLICT');
  }
  static tooMany(message = 'Too many requests'): ApiError {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, 'INTERNAL');
  }
  static notImplemented(message = 'Not implemented yet'): ApiError {
    return new ApiError(501, message, 'NOT_IMPLEMENTED');
  }
}
