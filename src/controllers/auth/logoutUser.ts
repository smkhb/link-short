import config from '@/config';
import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { verifyAccessToken } from '@/lib/jwt';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const logoutUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { authorization } = request.headers;

  if (!authorization) {
    return reply.status(401).send({
      message: 'Authorization header is missing',
      status: 'error',
    });
  }
  const token = authorization.split(' ')[1];

  try {
    const { userId } = verifyAccessToken(token);

    await db
      .update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, userId));

    reply.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: config.COOKIE_MAX_AGE,
      secure: config.NODE_ENV === 'production',
    });

    reply.status(200).send({
      message: 'Logout successful',
      status: 'success',
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      reply.status(401).send({
        code: 'TOKEN_EXPIRED',
        message: 'Refresh token has expired',
      });
      reply.log.error(`Refresh token has expired, ${error}`);
      return;
    }
    if (error instanceof JsonWebTokenError) {
      reply.status(401).send({
        code: 'INVALID_TOKEN',
        message: 'Refresh token is invalid',
      });
      reply.log.error(`Invalid refresh token, ${error}`);
      return;
    }

    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while logging out the user',
    });
    reply.log.error(`An error occurred while logging out the user, ${error}`);
    return;
  }
};
