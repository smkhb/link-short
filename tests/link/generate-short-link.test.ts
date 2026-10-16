import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import config from '@/config';
import { LinkResponseSchema } from '@/schemas/link.schema';

describe('POST /api/link/generate-link', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with success message and access token', async () => {
    const backHalf = 'short';
    const { user } = await makeUser();
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
      method: 'POST',
      url: '/api/link/generate-link',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'Example Link',
        destination: 'https://example.com',
        backHalf,
        shortLink: `${config.CLIENT_URL}/${backHalf}`,
        userId: user.id,
      },
    });

    expect(res.statusCode).toBe(201);
    expect.objectContaining({
      message: 'Short link generated successfully',
      status: 'success',
      link: LinkResponseSchema,
    });
  });
});
