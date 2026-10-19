import { linksTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { UpdateLink } from '@/schemas/link.schema';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function deleteUserShortLinkHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { linkId } = request.params as { linkId: string };

  try {
    const [link] = await db
      .delete(linksTable)
      .where(eq(linksTable.id, linkId))
      .returning();

    if (!link) {
      reply.status(404).send({
        message: 'Short link not found',
        status: 'error',
      });
      return;
    }

    reply.status(200).send({
      message: 'Short link deleted successfully',
      status: 'success',
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while deleting the short link',
    });
    reply.log.error(`Error deleting short link: ${error}`);
    return;
  }
}
