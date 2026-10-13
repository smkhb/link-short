import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';

describe('POST /api/auth/login', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
    await makeUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with success message and access token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'user@example.com',
        password: 'password123',
      },
    });

    expect(res.statusCode).toBe(200);
    expect.objectContaining({
      message: 'User logged in successfully',
      status: 'success',
      accessToken: expect.any(String),
    });
  });
});
