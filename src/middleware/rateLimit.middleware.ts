import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';

import { env } from '../config/env.js';

export function createApiRateLimiter(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' },
  });
}

/** Only failed attempts count toward the limit, so legitimate repeated logins aren't punished. */
export function createAuthRateLimiter(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    limit: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { status: 'error', message: 'Too many attempts, please try again later.' },
  });
}
