import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const authPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          return reply.status(401).send({
            message: 'TOKEN_EXPIRED',
            status: 'error',
          });
        }
        if (error instanceof JsonWebTokenError) {
          return reply.status(401).send({
            message: 'TOKEN_INVALID',
            status: 'error',
          });
        }
        return reply.status(401).send({
          message: 'TOKEN_VERIFICATION_FAILED',
          status: 'error',
        });
      }
    },
  );
});
