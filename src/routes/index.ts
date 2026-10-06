import { FastifyInstance } from 'fastify';

export async function appRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_, reply) => {
    return reply.status(200).send({
      message: 'Welcome to the Link Shortener API!',
      status: 'success',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });
}

// Add more routes as needed
