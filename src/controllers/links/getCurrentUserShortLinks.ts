import { linksTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function getCurrentUserShortLinksHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.user;

  try {
    const links = await db
      .select()
      .from(linksTable)
      .where(eq(linksTable.userId, userId));

    reply.status(200).send({
      message: 'Short links retrieved successfully',
      status: 'success',
      links,
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while retrieving the short link',
    });
    reply.log.error(`Error retrieving short link: ${error}`);
    return;
  }
}
