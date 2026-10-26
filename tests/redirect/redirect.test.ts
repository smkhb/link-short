import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import config from '@/config';
import { LinkResponseSchema } from '@/schemas/link.schema';
import { makeShortLink } from '../factories/makeShortLink';

describe('GET /api/:backHalf', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should redirect to the original URL', async () => {
    const backHalf = 'short';
    const { user } = await makeUser();

    makeShortLink({
      userId: user.id,
      destination: 'https://facebook.com',
      backHalf,
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/${backHalf}`,
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://facebook.com');
  });
});
