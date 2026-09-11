import type { Request } from 'express';

import { ApiError } from '../../utils/apiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { UserModel } from './user.model.js';

export const getCurrentUser = asyncHandler(async (req: Request, res) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const user = await UserModel.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json({
    status: 'success',
    data: { id: String(user._id), email: user.email, createdAt: user.createdAt },
  });
});
