import { linksTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { generateBackHalf } from '@/utils';
import z from 'zod';

const linkSchema = z.object({
  title: z.string().default('Example Link'),
  destination: z.url().default('https://google.com'),
  backHalf: z.string().optional(),
  userId: z.uuid().default('00000000-0000-0000-0000-000000000000'),
});

export type Link = z.input<typeof linkSchema>;

export const makeShortLink = async (overrides: Link = {}) => {
  const { title, destination, backHalf, userId } = linkSchema.parse(overrides);

  const verifiedBackHalf = backHalf || generateBackHalf();

  const [link] = await db
    .insert(linksTable)
    .values({
      title,
      destination,
      backHalf: verifiedBackHalf,
      shortLink: `http://localhost:3000/${verifiedBackHalf}`,
      userId,
    })
    .returning();

  return { link };
};
