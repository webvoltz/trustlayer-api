import { afterEach, describe, expect, it, vi } from 'vitest';

const REQUIRED_BASE_ENV = {
  NODE_ENV: 'test',
  JWT_SECRET: 'test-only-secret-key-do-not-use-in-production',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/trustlayer-env-test',
};

describe('config/env S3 validation', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('throws when STORAGE_PROVIDER=s3 and the S3 credentials are missing', async () => {
    process.env = { ...originalEnv, ...REQUIRED_BASE_ENV, STORAGE_PROVIDER: 's3' };
    vi.resetModules();

    await expect(import('../config/env.js')).rejects.toThrow(/Invalid environment configuration/);
  });

  it('loads successfully when STORAGE_PROVIDER=s3 and every S3 variable is set', async () => {
    process.env = {
      ...originalEnv,
      ...REQUIRED_BASE_ENV,
      STORAGE_PROVIDER: 's3',
      S3_BUCKET: 'demo-bucket',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: 'demo-access-key',
      S3_SECRET_ACCESS_KEY: 'demo-secret-key',
    };
    vi.resetModules();

    const { env } = await import('../config/env.js');
    expect(env.STORAGE_PROVIDER).toBe('s3');
  });
});
