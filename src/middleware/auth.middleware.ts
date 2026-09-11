import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/apiError.js';
import { verifyAccessToken } from '../utils/tokens.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
