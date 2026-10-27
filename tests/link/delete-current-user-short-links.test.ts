import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import { LinkResponseSchema } from '@/schemas/link.schema';
import { makeShortLink } from '../factories/makeShortLink';
import { generateAccessToken } from '@/lib/jwt';

describe('DELETE /api/link/my-links/:linkId', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with success message and links', async () => {
    const { user } = await makeUser();
    const { link } = await makeShortLink({ userId: user.id });
    const token = generateAccessToken({ userId: user.id });

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/link/my-links/${link.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.statusCode).toBe(200);
  });

  it("returns 403 when trying to delete another user's link", async () => {
    const { user } = await makeUser();
    const { user: anotherUser } = await makeUser({
      email: 'anotheruser@example.com',
    });
    const anotherUserToken = generateAccessToken({ userId: anotherUser.id });

    const { link } = await makeShortLink({ userId: user.id });

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/link/my-links/${link.id}`,
      headers: {
        Authorization: `Bearer ${anotherUserToken}`,
      },
    });

    expect(res.statusCode).toBe(403);
  });
});
