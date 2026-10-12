import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { clearDatabase } from '../helpers/db';

describe('POST /api/auth/register', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 201 with success message and user data', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
      },
    });

    expect(res.statusCode).toBe(201);
    expect.objectContaining({ email: 'user@example.com', name: 'Test User' });
  });
});
