import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export const authPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (error: any) {
        return reply.status(401).send({
          status: 'error',
          message: 'TOKEN_VERIFICATION_FAILED',
        });
      }
    },
  );
});
