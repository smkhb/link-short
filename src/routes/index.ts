import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authRoutes } from './auth';
import { userRoutes } from './user';

export async function appRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (_, reply) => {
    return reply.status(200).send({
      message: 'Welcome to the Link Shortener API!',
      status: 'success',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  await server.register(authRoutes, { prefix: '/auth' });
  await server.register(userRoutes, { prefix: '/user' });
}
