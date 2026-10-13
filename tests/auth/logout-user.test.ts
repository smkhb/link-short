import { FastifyInstance } from 'fastify';
import { makeUser } from '../factories/makeUser';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';

describe('POST /api/auth/logout', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
    await makeUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should log out the user', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'user@example.com',
        password: 'password123',
      },
    });
    const accessToken = loginResponse.json().accessToken;

    if (!accessToken) {
      throw new Error('Access token not found in login response');
    }

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/auth/logout',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
});
