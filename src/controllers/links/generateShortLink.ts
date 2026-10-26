import config from '@/config';
import { linksTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { CreateLink } from '@/schemas/link.schema';
import { generateBackHalf } from '@/utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { v7 as uuidv7 } from 'uuid';

export async function generateShortLinkHandler(
  request: FastifyRequest<{ Body: CreateLink }>,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.user;
  const { destination, backHalf, title } = request.body;
  const id = uuidv7();
  const verifiedBackHalf = backHalf || generateBackHalf();

  try {
    const [shortLink] = await db
      .insert(linksTable)
      .values({
        id,
        title,
        destination,
        backHalf: verifiedBackHalf,
        shortLink: `${config.CLIENT_URL}/api/${verifiedBackHalf}`,
        userId,
      })
      .returning();

    reply.status(201).send({
      message: 'Short link generated successfully',
      status: 'success',
      link: shortLink,
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while generating the short link',
    });
    reply.log.error(`Error generating short link: ${error}`);
    return;
  }
}
