import Fastify from 'fastify';
import config from './config';
import cors from '@fastify/cors';
import corsOptions from './lib/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyRateLimit from './lib/rate-limit';
import { connectToDB, disconnectFromDB } from './lib/drizzle';
import { appRoutes } from './routes';

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

fastify.register(cors, corsOptions);
fastify.register(rateLimit, fastifyRateLimit('basic'));

async function start() {
  try {
    await connectToDB();

    await fastify.register(appRoutes);

    fastify.listen({ port: 3000 });

    fastify.log.info(`Server listening at http://localhost:${config.PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}
start();

const serverTermination = async (signal: string) => {
  fastify.log.info(`Received ${signal}. Shutting down gracefully...`);
  await disconnectFromDB();
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', () => serverTermination('SIGTERM'));
process.on('SIGINT', () => serverTermination('SIGINT'));
