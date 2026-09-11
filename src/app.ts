import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { userRouter } from './modules/users/user.routes.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(requestLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(apiRateLimiter);

  app.use('/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
