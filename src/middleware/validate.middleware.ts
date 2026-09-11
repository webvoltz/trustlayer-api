import type { NextFunction, Request, Response } from 'express';
import { treeifyError, type ZodType } from 'zod';

import { ApiError } from '../utils/apiError.js';

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const tree = treeifyError(result.error);
      const details = 'properties' in tree ? tree.properties : tree.errors;
      next(ApiError.unprocessable('Validation failed', details));
      return;
    }

    req.body = result.data;
    next();
  };
}
