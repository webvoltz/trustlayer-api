import { createHash, randomBytes } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_TOKEN_TTL_SECONDS,
    issuer: 'trustlayer-api',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET, { issuer: 'trustlayer-api' });

  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new Error('Invalid access token payload');
  }

  return { sub: payload.sub };
}

/** Generates a high-entropy, single-use token to hand to the user (e.g. in a reset link). */
export function generateRawToken(): string {
  return randomBytes(32).toString('hex');
}

/** Only the SHA-256 hash of a raw token is ever persisted, so a database leak can't be replayed. */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
