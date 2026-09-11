import { describe, expect, it } from 'vitest';

import { ApiError } from '../utils/apiError.js';

describe('ApiError factories', () => {
  it('builds errors with the expected status codes', () => {
    expect(ApiError.badRequest('bad').statusCode).toBe(400);
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.conflict('dup').statusCode).toBe(409);
    expect(ApiError.unprocessable('bad input').statusCode).toBe(422);
    expect(ApiError.tooMany().statusCode).toBe(429);
  });

  it('carries optional validation details', () => {
    const error = ApiError.unprocessable('invalid', { email: ['Required'] });
    expect(error.details).toEqual({ email: ['Required'] });
  });
});
