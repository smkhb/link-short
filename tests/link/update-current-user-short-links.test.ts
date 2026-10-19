import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import { LinkResponseSchema } from '@/schemas/link.schema';
import { makeShortLink } from '../factories/makeShortLink';

describe('PATCH /api/link/my-links/:linkId', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with success message and links', async () => {
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
    const { link } = await makeShortLink({ userId: user.id });

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/link/my-links/${link.id}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'Updated Link Title',
      },
    });

    expect(res.statusCode).toBe(200);
    expect.objectContaining({
      message: 'Short link updated successfully',
      status: 'success',
      links: LinkResponseSchema,
    });
  });
});
