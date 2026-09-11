import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';

describe('password reset flow', () => {
  const app = createApp();
  const email = 'reset-flow@example.com';
  const oldPassword = 'Sup3rSecret!';
  const newPassword = 'EvenStr0nger!';

  it('completes register -> forgot-password -> reset-password -> login with new password', async () => {
    await supertest(app).post('/api/v1/auth/register').send({ email, password: oldPassword });

    const forgotResponse = await supertest(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email });
    expect(forgotResponse.status).toBe(200);
    const resetToken = forgotResponse.body.data.resetToken as string;
    expect(resetToken).toEqual(expect.any(String));

    const resetResponse = await supertest(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, password: newPassword });
    expect(resetResponse.status).toBe(200);

    const oldLogin = await supertest(app)
      .post('/api/v1/auth/login')
      .send({ email, password: oldPassword });
    expect(oldLogin.status).toBe(401);

    const newLogin = await supertest(app)
      .post('/api/v1/auth/login')
      .send({ email, password: newPassword });
    expect(newLogin.status).toBe(200);
  });

  it('does not reveal whether an email is registered', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'never-registered@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.data.resetToken).toBeUndefined();
  });

  it('rejects an invalid or expired reset token', async () => {
    const response = await supertest(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'a'.repeat(64), password: newPassword });

    expect(response.status).toBe(400);
  });
});
