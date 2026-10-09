import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { ResetLinkPayload, verifyResetLinkToken } from '@/lib/jwt';
import { ResetPassword, ResetPasswordQuery } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import crypto from 'crypto';
import { hashToken } from '@/lib/hashToken';

export const resetPasswordHandler = async (
  request: FastifyRequest<{
    Body: ResetPassword;
    Querystring: ResetPasswordQuery;
  }>,
  reply: FastifyReply,
): Promise<void> => {
  const { newPassword } = request.body;
  const { token } = request.query;

  try {
    const { email } = verifyResetLinkToken(token) as ResetLinkPayload;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      reply.log.error(`User with email ${email} not found for password reset`);
      return reply.status(404).send({
        message: 'User not found',
        status: 'error',
      });
    }

    if (
      !user.passwordResetToken ||
      hashToken(token) !== user.passwordResetToken
    ) {
      reply.log.error(
        `No password reset request found or invalid token for user with email ${email}`,
      );
      return reply.status(400).send({
        message: 'No password reset request found or invalid token',
        status: 'error',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db
      .update(usersTable)
      .set({ password: hashedPassword, passwordResetToken: null })
      .where(eq(usersTable.email, email));

    reply.status(200).send({
      message: 'Password reset successfully.',
      status: 'success',
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      reply.status(401).send({
        code: 'TOKEN_EXPIRED',
        message: 'Reset token has expired',
      });
      reply.log.error(`Reset token has expired, ${error}`);
      return;
    }

    if (error instanceof JsonWebTokenError) {
      reply.status(401).send({
        code: 'INVALID_TOKEN',
        message: 'Reset token is invalid',
      });
      reply.log.error(`Invalid reset token, ${error}`);
      return;
    }

    reply.status(500).send({
      message: 'An error occurred while resetting the password.',
      status: 'error',
    });
    request.log.error(
      `An error occurred while resetting the password, ${error}`,
    );
    return;
  }
};
