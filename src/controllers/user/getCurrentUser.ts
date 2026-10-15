import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function getCurrentUserHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.user;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    return reply.status(200).send({
      message: 'Current user retrieved successfully',
      status: 'success',
      user,
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while retrieving the current user',
    });
    reply.log.error(
      `An error occurred while retrieving the current user, ${error}`,
    );
    return;
  }
}
