import { linksTable, usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { eq, sql } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function redirectHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { backHalf } = request.params as { backHalf: string };

  try {
    const [link] = await db
      .select()
      .from(linksTable)
      .where(eq(linksTable.backHalf, backHalf));

    if (!link) {
      reply.status(404).send({
        message: 'Short link not found',
        status: 'error',
      });
      return;
    }

    await db
      .update(linksTable)
      .set({ totalVisitCount: sql`${linksTable.totalVisitCount} + 1` })
      .where(eq(linksTable.backHalf, backHalf));

    await db
      .update(usersTable)
      .set({ totalVisitCount: sql`${usersTable.totalVisitCount} + 1` })
      .where(eq(usersTable.id, link.userId));

    reply.status(302).redirect(link.destination);
  } catch (error) {
    reply.status(500).send({
      message: 'An error occurred while processing the redirect',
      status: 'error',
    });
    reply.log.error(`Error during redirect: ${error}`);
    return;
  }
}
