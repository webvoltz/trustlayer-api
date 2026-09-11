import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';

describe('GET /health', () => {
  it('reports ok and stamps a correlation id header', async () => {
    const response = await supertest(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('echoes back a caller-supplied X-Request-Id header', async () => {
    const response = await supertest(createApp())
      .get('/health')
      .set('X-Request-Id', 'caller-supplied-id');

    expect(response.headers['x-request-id']).toBe('caller-supplied-id');
  });
});

describe('unknown routes', () => {
  it('returns a structured 404', async () => {
    const response = await supertest(createApp()).get('/this-route-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
    expect(response.body.requestId).toBeTruthy();
  });
});
