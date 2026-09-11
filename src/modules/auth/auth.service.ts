import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { ApiError } from '../../utils/apiError.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { generateRawToken, hashToken, signAccessToken } from '../../utils/tokens.js';
import { UserModel } from '../users/user.model.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema.js';

export interface AuthResult {
  accessToken: string;
  user: { id: string; email: string };
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await UserModel.create({ email: input.email, passwordHash });
  const userId = String(user._id);

  return { accessToken: signAccessToken(userId), user: { id: userId, email: user.email } };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const userId = String(user._id);
  return { accessToken: signAccessToken(userId), user: { id: userId, email: user.email } };
}

export interface ForgotPasswordResult {
  resetToken?: string;
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> {
  const user = await UserModel.findOne({ email: input.email });

  // Respond identically whether or not the account exists, so this endpoint can't be used to
  // enumerate registered emails.
  if (!user) {
    logger.info({ email: input.email }, 'Password reset requested for an unknown email');
    return {};
  }

  const rawToken = generateRawToken();
  user.passwordResetTokenHash = hashToken(rawToken);
  user.passwordResetTokenExpiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60_000,
  );
  await user.save();

  logger.info({ userId: String(user._id) }, 'Password reset token issued');

  // The token is only ever handed back directly outside production; in a real deployment it
  // would be delivered exclusively through the email channel.
  return { resetToken: env.exposePasswordResetToken ? rawToken : undefined };
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = hashToken(input.token);
  const user = await UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetTokenExpiresAt +passwordHash');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.passwordHash = await hashPassword(input.password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();
}
