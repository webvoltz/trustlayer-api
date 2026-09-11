import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';

describe('GET /api/v1/users/me', () => {
  const app = createApp();
  const email = 'protected-route@example.com';
  const password = 'Sup3rSecret!';

  async function registerAndGetToken(): Promise<string> {
    const response = await supertest(app).post('/api/v1/auth/register').send({ email, password });
    return response.body.data.accessToken as string;
  }

  it('rejects a request with no Authorization header', async () => {
    const response = await supertest(app).get('/api/v1/users/me');
    expect(response.status).toBe(401);
  });

  it('rejects a malformed or invalid token', async () => {
    const response = await supertest(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
  });

  it('returns the caller profile for a valid token', async () => {
    const token = await registerAndGetToken();

    const response = await supertest(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
  });
});
