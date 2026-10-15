import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { UpdateUser } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';

export async function updateCurrentUserHandler(
  request: FastifyRequest<{ Body: UpdateUser }>,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.user;
  const { name, email, password } = request.body;

  try {
    const [user] = await db
      .update(usersTable)
      .set({
        name,
        email,
        password: password ? await bcrypt.hash(password, 10) : undefined,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    reply.status(200).send({
      message: 'Current user updated successfully',
      status: 'success',
      user,
    });
  } catch (error) {
    console.error('Error updating current user:', error);
    reply.status(500).send({
      message: 'An error occurred while updating the current user',
      status: 'error',
    });
  }
}
