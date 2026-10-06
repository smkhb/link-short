import Fastify from 'fastify';
import config from './config';
import { connectToDB } from './lib/drizzle';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
});

connectToDB();

fastify.get('/', async (_, reply) => {
  reply.send({ hello: 'world' });
});

fastify.listen({ port: 3000 }, (error, address) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
  fastify.log.info(`Server listening at http://localhost:${address}`);
});

process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT. Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});
