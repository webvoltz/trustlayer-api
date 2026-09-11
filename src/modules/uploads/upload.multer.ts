import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';

import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(ApiError.unprocessable(`Unsupported file type: ${file.mimetype}`));
    return;
  }
  callback(null, true);
}

export const uploadSingleFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter,
}).single('file');
