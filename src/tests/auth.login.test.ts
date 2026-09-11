import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';

describe('auth register + login', () => {
  const app = createApp();
  const email = 'login-flow@example.com';
  const password = 'Sup3rSecret!';

  it('registers a new user and returns an access token', async () => {
    const response = await supertest(app).post('/api/v1/auth/register').send({ email, password });

    expect(response.status).toBe(201);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe(email);
  });

  it('rejects a duplicate registration for the same email', async () => {
    const response = await supertest(app).post('/api/v1/auth/register').send({ email, password });

    expect(response.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const response = await supertest(app).post('/api/v1/auth/login').send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
  });

  it('rejects an incorrect password without revealing which field was wrong', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword1' });

    expect(response.status).toBe(401);
  });

  it('rejects a login for an email that was never registered', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'WhoKnows1' });

    expect(response.status).toBe(401);
  });
});
