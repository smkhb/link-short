import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';

describe('DELETE /api/user/current', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
    await makeUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete the current user', async () => {
    const { payload } = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'user@example.com',
        password: 'password123',
      },
    });

    const { accessToken } = JSON.parse(payload);

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/user/current',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    expect.objectContaining({
      message: 'Current user deleted successfully',
      status: 'success',
      deletedUserId: expect.any(String),
    });
  });
});
