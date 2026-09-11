import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';
import { LocalStorageAdapter } from '../modules/uploads/adapters/local.adapter.js';
import { S3StorageAdapter } from '../modules/uploads/adapters/s3.adapter.js';

describe('LocalStorageAdapter', () => {
  it('writes the buffer to disk under a generated key and returns a local url', async () => {
    const uploadDir = path.join(process.env['UPLOAD_DIR'] ?? 'uploads', 'unit-test');
    const adapter = new LocalStorageAdapter(uploadDir);

    const result = await adapter.upload({
      buffer: Buffer.from('fake-image-bytes'),
      originalName: 'photo.png',
      mimeType: 'image/png',
    });

    expect(result.key).toMatch(/\.png$/);
    expect(result.url).toBe(`/uploads/${result.key}`);

    const written = await readFile(path.join(uploadDir, result.key));
    expect(written.toString()).toBe('fake-image-bytes');

    await rm(uploadDir, { recursive: true, force: true });
  });
});

describe('S3StorageAdapter', () => {
  it('throws a clear configuration error when S3 credentials are missing', () => {
    expect(() => new S3StorageAdapter()).toThrow(/S3_BUCKET/);
  });
});

describe('POST /api/v1/uploads', () => {
  const app = createApp();
  const email = 'uploader@example.com';
  const password = 'Sup3rSecret!';
  let token: string;

  beforeAll(async () => {
    const response = await supertest(app).post('/api/v1/auth/register').send({ email, password });
    token = response.body.data.accessToken as string;
  });

  it('rejects an unauthenticated upload', async () => {
    const response = await supertest(app)
      .post('/api/v1/uploads')
      .attach('file', Buffer.from('fake-image-bytes'), {
        filename: 'photo.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(401);
  });

  it('stores an allowed image and returns its key and url', async () => {
    const response = await supertest(app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake-image-bytes'), {
        filename: 'photo.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.url).toMatch(/^\/uploads\//);
  });

  it('rejects a disallowed file type with 422', async () => {
    const response = await supertest(app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(422);
  });

  it('rejects a request with no file attached', async () => {
    const response = await supertest(app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
