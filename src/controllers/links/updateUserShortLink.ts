import { linksTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { UpdateLink } from '@/schemas/link.schema';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function updateUserShortLinkHandler(
  request: FastifyRequest<{ Body: UpdateLink }>,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.user;
  const { linkId } = request.params as { linkId: string };
  const { title, destination, backHalf } = request.body;

  try {
    const [link] = await db
      .update(linksTable)
      .set({
        title,
        destination,
        backHalf,
      })
      .where(eq(linksTable.id, linkId))
      .returning();

    if (!link) {
      reply.status(404).send({
        message: 'Short link not found',
        status: 'error',
      });
      return;
    }

    if (link.userId !== userId) {
      reply.status(403).send({
        message: 'You are not authorized to update this short link',
        status: 'error',
      });
      return;
    }

    reply.status(200).send({
      message: 'Short link updated successfully',
      status: 'success',
      link,
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while updating the short link',
    });
    reply.log.error(`Error updating short link: ${error}`);
    return;
  }
}
