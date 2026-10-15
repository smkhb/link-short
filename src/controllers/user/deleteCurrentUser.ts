import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function deleteCurrentUserHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.user;

  try {
    const [deletedUser] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning({ deletedUserId: usersTable.id });

    if (!deletedUser) {
      return reply.status(404).send({
        status: 'error',
        message: 'USER_NOT_FOUND',
      });
    }

    return reply.status(200).send({
      message: 'Current user deleted successfully',
      status: 'success',
      deletedUserId: deletedUser.deletedUserId,
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while deleting the current user',
    });
    reply.log.error(
      `An error occurred while deleting the current user, ${error}`,
    );
    return;
  }
}
