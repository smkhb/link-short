import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import { UserResponseSchema } from '@/schemas/user.schema';

describe('PATCH /api/user/current', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
    await makeUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update the current user', async () => {
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
      method: 'PATCH',
      url: '/api/user/current',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Updated User',
        email: 'user2@example.com',
      },
    });

    expect(res.statusCode).toBe(200);
    expect.objectContaining({
      message: 'Current user updated successfully',
      status: 'success',
      user: UserResponseSchema,
    });
  });
});
