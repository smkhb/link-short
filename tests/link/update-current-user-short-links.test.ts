import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import { LinkResponseSchema } from '@/schemas/link.schema';
import { makeShortLink } from '../factories/makeShortLink';
import { generateAccessToken } from '@/lib/jwt';

describe('PATCH /api/link/my-links/:linkId', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it.skip('returns 200 with success message and links', async () => {
    const { user } = await makeUser();
    const { link } = await makeShortLink({ userId: user.id });
    const token = generateAccessToken({ userId: user.id });

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/link/my-links/${link.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        title: 'Updated Link Title',
      },
    });
    const { link: updatedLink } = res.json();
    expect(res.statusCode).toBe(200);
    expect(updatedLink.title).toBe('Updated Link Title');
  });

  it("returns 403 when trying to update another user's link", async () => {
    const { user } = await makeUser();
    const { user: anotherUser } = await makeUser({
      email: 'anotheruser@example.com',
    });
    const anotherUserToken = generateAccessToken({ userId: anotherUser.id });

    const { link } = await makeShortLink({ userId: user.id });

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/link/my-links/${link.id}`,
      headers: {
        Authorization: `Bearer ${anotherUserToken}`,
      },
      payload: {
        title: 'Updated Link Title',
      },
    });

    expect(res.statusCode).toBe(403);
  });
});
