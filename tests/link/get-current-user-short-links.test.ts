import { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import { LinkResponseSchema } from '@/schemas/link.schema';
import { makeShortLink } from '../factories/makeShortLink';
import { generateAccessToken } from '@/lib/jwt';

describe('GET /api/link/my-links', () => {
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

  const seedLinks = async (userId: string, titles: string[]) => {
    for (const [i, title] of titles.entries()) {
      await makeShortLink({
        userId,
        title,
        destination: `https://example.com/${i}`,
      });
    }
  };

  it('returns 200 with success message and links', async () => {
    const { user } = await makeUser();
    const token = generateAccessToken({ userId: user.id });
    await seedLinks(user.id, ['Link 1', 'Link 2', 'Link 3', 'Link 4']);

    const res = await app.inject({
      method: 'GET',
      url: '/api/link/my-links',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { data } = res.json();

    expect(res.statusCode).toBe(200);
    expect(data.links.map((link: any) => link.title)).toEqual([
      'Link 4',
      'Link 3',
      'Link 2',
      'Link 1',
    ]);
    expect(data.previous).toBeNull();
  });

  it('should not reurn previous link when offset is 0', async () => {
    const { user } = await makeUser();
    const token = generateAccessToken({ userId: user.id });
    await seedLinks(user.id, [
      'Link 1',
      'Link 2',
      'Link 3',
      'Link 4',
      'Link 5',
    ]);

    const res = await app.inject({
      method: 'GET',
      url: '/api/link/my-links?offset=2&limit=5&sortBy=title&order=asc',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const { data } = res.json();

    expect(res.statusCode).toBe(200);
    expect(data.links).toHaveLength(3);
    expect(data.next).toBeNull();
  });

  it('should keep serach, sortBy, and order params in next and previous links', async () => {
    const { user } = await makeUser();
    const token = generateAccessToken({ userId: user.id });
    await seedLinks(user.id, [
      'Link 1',
      'Link 2',
      'Link 3',
      'Target 1',
      'Target 2',
      'Target 3',
    ]);

    const res = await app.inject({
      method: 'GET',
      url: '/api/link/my-links?search=Target&limit=1&sortBy=title&order=asc',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const { data } = res.json();

    expect(res.statusCode).toBe(200);
    expect(data.links).toHaveLength(1);
    expect(data.next).toContain('search=Target');
    expect(data.next).toContain('sortBy=title');
    expect(data.next).toContain('order=asc');
  });
});
