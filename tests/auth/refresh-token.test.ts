import { FastifyInstance } from 'fastify';
import { makeUser } from '../factories/makeUser';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';

describe('POST /api/auth/refresh-token', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
    await makeUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with a access token', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'user@example.com',
        password: 'password123',
      },
    });

    const refreshToken = loginResponse.cookies.find(
      (cookie) => cookie.name === 'refreshToken',
    )?.value;

    if (!refreshToken) {
      throw new Error('Refresh token not found in login response');
    }

    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/refresh-token',
      cookies: {
        refreshToken,
      },
    });

    expect(response.statusCode).toBe(200);
    expect.objectContaining({
      message: 'RefreshToken received successfully',
      status: 'success',
      accessToken: expect.any(String),
    });
  });
});
