import { describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../app.js';

describe('auth rate limiting', () => {
  it('blocks repeated failed login attempts with 429 once the limit is exceeded', async () => {
    const app = createApp();
    const credentials = { email: 'rate-limited@example.com', password: 'WrongPassword1' };

    // AUTH_RATE_LIMIT_MAX is set to 3 in the test environment (see globalSetup.ts).
    const attempts = await Promise.all(
      Array.from({ length: 4 }, () => supertest(app).post('/api/v1/auth/login').send(credentials)),
    );

    const statuses = attempts.map((response) => response.status).sort();
    expect(statuses.filter((status) => status === 401)).toHaveLength(3);
    expect(statuses.filter((status) => status === 429)).toHaveLength(1);
  });
});
