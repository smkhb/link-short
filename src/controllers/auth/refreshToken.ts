import { generateAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const refreshTokenHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { refreshToken } = request.cookies;

  if (!refreshToken) {
    return reply.status(401).send({
      message: 'Refresh token is missing',
      status: 'error',
    });
  }

  try {
    const { userId } = verifyRefreshToken(refreshToken);

    const accessToken = generateAccessToken({ userId });

    reply.status(200).send({
      message: 'RefreshToken received successfully',
      status: 'success',
      accessToken,
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
      message: 'An error occurred while refreshing the token',
    });
    reply.log.error(
      `An error occurred while refreshing the token for the user, ${error}`,
    );
    return;
  }
};
