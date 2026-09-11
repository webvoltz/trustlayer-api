import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

import {
  generateRawToken,
  hashToken,
  signAccessToken,
  verifyAccessToken,
} from '../utils/tokens.js';

describe('tokens', () => {
  it('signs and verifies a round trip', () => {
    const token = signAccessToken('user-123');
    expect(verifyAccessToken(token).sub).toBe('user-123');
  });

  it('rejects a token with no subject claim', () => {
    const secret = process.env['JWT_SECRET'] ?? '';
    const malformedToken = jwt.sign({}, secret, { issuer: 'trustlayer-api' });

    expect(() => verifyAccessToken(malformedToken)).toThrow();
  });

  it('generates unique raw tokens and stable hashes', () => {
    const first = generateRawToken();
    const second = generateRawToken();

    expect(first).not.toBe(second);
    expect(hashToken(first)).toBe(hashToken(first));
    expect(hashToken(first)).not.toBe(hashToken(second));
  });
});
