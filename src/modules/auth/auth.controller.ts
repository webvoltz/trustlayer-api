import { asyncHandler } from '../../utils/asyncHandler.js';
import type { TypedRequestBody } from '../../utils/httpTypes.js';
import * as authService from './auth.service.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema.js';

export const register = asyncHandler<TypedRequestBody<RegisterInput>>(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({ status: 'success', data: result });
});

export const login = asyncHandler<TypedRequestBody<LoginInput>>(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json({ status: 'success', data: result });
});

export const forgotPassword = asyncHandler<TypedRequestBody<ForgotPasswordInput>>(
  async (req, res) => {
    const result = await authService.requestPasswordReset(req.body);
    res.status(200).json({
      status: 'success',
      message: 'If an account exists for that email, a reset link has been sent.',
      data: result,
    });
  },
);

export const resetPasswordHandler = asyncHandler<TypedRequestBody<ResetPasswordInput>>(
  async (req, res) => {
    await authService.resetPassword(req.body);
    res.status(200).json({ status: 'success', message: 'Password has been reset.' });
  },
);
