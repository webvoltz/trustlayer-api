import { Router } from 'express';

import { createAuthRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { forgotPassword, login, register, resetPasswordHandler } from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema.js';

export function createAuthRouter(): Router {
  const router = Router();
  const authRateLimiter = createAuthRateLimiter();

  router.post('/register', validateBody(registerSchema), register);
  router.post('/login', authRateLimiter, validateBody(loginSchema), login);
  router.post(
    '/forgot-password',
    authRateLimiter,
    validateBody(forgotPasswordSchema),
    forgotPassword,
  );
  router.post(
    '/reset-password',
    authRateLimiter,
    validateBody(resetPasswordSchema),
    resetPasswordHandler,
  );

  return router;
}
