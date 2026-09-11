import { Router } from 'express';

import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { forgotPassword, login, register, resetPasswordHandler } from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', authRateLimiter, validateBody(loginSchema), login);
authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  '/reset-password',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  resetPasswordHandler,
);
