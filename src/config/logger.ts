import pino from 'pino';

import { env } from './env.js';

const level = env.isTest ? 'silent' : env.isProduction ? 'info' : 'debug';

export const logger = pino({
  level,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.newPassword',
      'req.body.currentPassword',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
});
