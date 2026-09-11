import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/apiError.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.id;

  if (err instanceof ApiError) {
    req.log.warn({ err }, err.message);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details,
      requestId,
    });
    return;
  }

  req.log.error({ err }, 'Unhandled error');
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    requestId,
  });
}
