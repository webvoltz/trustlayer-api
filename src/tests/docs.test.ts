import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';

describe('GET /docs', () => {
  it('serves the Swagger UI page', async () => {
    const response = await supertest(createApp()).get('/docs/');

    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
  });
});
