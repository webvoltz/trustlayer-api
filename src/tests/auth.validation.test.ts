import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';

describe('POST /api/v1/auth/register validation', () => {
  it('rejects an invalid email and a weak password with 422 and field errors', async () => {
    const response = await supertest(createApp())
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(422);
    expect(response.body.status).toBe('error');
    expect(response.body.details).toHaveProperty('email');
    expect(response.body.details).toHaveProperty('password');
  });

  it('rejects a request body that is missing required fields', async () => {
    const response = await supertest(createApp()).post('/api/v1/auth/register').send({});

    expect(response.status).toBe(422);
    expect(response.body.details).toHaveProperty('email');
    expect(response.body.details).toHaveProperty('password');
  });
});
