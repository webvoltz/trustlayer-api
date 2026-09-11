import { Router } from 'express';

import { requireAuth } from '../../middleware/auth.middleware.js';
import { uploadFile } from './upload.controller.js';
import { uploadSingleFile } from './upload.multer.js';

export const uploadRouter = Router();

uploadRouter.post('/', requireAuth, uploadSingleFile, uploadFile);
