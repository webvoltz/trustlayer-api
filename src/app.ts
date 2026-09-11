import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { openApiDocument } from './docs/openapi.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { createApiRateLimiter } from './middleware/rateLimit.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { uploadRouter } from './modules/uploads/upload.routes.js';
import { userRouter } from './modules/users/user.routes.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(requestLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(createApiRateLimiter());

  if (env.STORAGE_PROVIDER === 'local') {
    app.use('/uploads', express.static(env.UPLOAD_DIR));
  }

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use('/health', healthRouter);
  app.use('/api/v1/auth', createAuthRouter());
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/uploads', uploadRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
