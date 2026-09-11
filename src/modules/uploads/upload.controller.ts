import type { Request } from 'express';

import { ApiError } from '../../utils/apiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getStorageAdapter } from './adapters/index.js';

export const uploadFile = asyncHandler(async (req: Request, res) => {
  if (!req.file) {
    throw ApiError.badRequest('A file is required');
  }

  const adapter = getStorageAdapter();
  const result = await adapter.upload({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
  });

  res.status(201).json({ status: 'success', data: result });
});
