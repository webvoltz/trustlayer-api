import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function setup(): Promise<() => Promise<void>> {
  process.env['NODE_ENV'] = 'test';
  process.env['JWT_SECRET'] = 'test-only-secret-key-do-not-use-in-production';
  process.env['JWT_ACCESS_TOKEN_TTL_SECONDS'] = '900';
  process.env['CORS_ORIGIN'] = '*';
  process.env['STORAGE_PROVIDER'] = 'local';
  process.env['UPLOAD_DIR'] = path.join(os.tmpdir(), `trustlayer-uploads-test-${randomUUID()}`);
  process.env['MAX_UPLOAD_SIZE_MB'] = '1';
  process.env['RATE_LIMIT_MAX'] = '1000';
  process.env['RATE_LIMIT_WINDOW_MS'] = '60000';
  process.env['AUTH_RATE_LIMIT_MAX'] = '3';
  process.env['AUTH_RATE_LIMIT_WINDOW_MS'] = '60000';
  process.env['PASSWORD_RESET_TOKEN_TTL_MINUTES'] = '60';
  process.env['EXPOSE_PASSWORD_RESET_TOKEN'] = 'true';

  const mongo = await MongoMemoryServer.create();
  process.env['MONGODB_URI'] = mongo.getUri();

  return async () => {
    await mongo.stop();
  };
}
