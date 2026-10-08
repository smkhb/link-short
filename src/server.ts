import Fastify, { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

import config from './config';
import corsOptions from './lib/cors';
import fastifyRateLimit from './lib/rate-limit';
import { connectToDB, disconnectFromDB } from './lib/drizzle';
import { appRoutes } from './routes';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { authPlugin } from './plugins/auth';
import { ZodError } from 'zod';

export async function buildServer() {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Configura os compiladores do Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Tratamento global de erros de validação do Zod
  app.setErrorHandler((error: FastifyError, _, reply) => {
    if (error instanceof ZodError || error.validation) {
      reply.log.error({ error }, 'Validation error occurred');
      return reply.status(400).send({
        code: 'Validation Error',
        message: 'Validation failed for one or more fields',
        errors: error.validation
          ? error.validation
          : { code: error.code, message: error.message },
      });
    }

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      code: error.code || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  });

  // Configura o Swagger
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Link Shortener API',
        description: 'API documentation for the Link Shortener service',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:${config.PORT}`, description: 'Local server' },
      ],
    },
    transform: jsonSchemaTransform,
  });

  // Configura o Swagger UI
  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });

  // Configura CORS e Rate Limit
  await app.register(cors, corsOptions);
  await app.register(rateLimit, fastifyRateLimit('basic'));

  // Configura cookies e JWT
  await app.register(fastifyCookie, {
    secret: config.COOKIE_SECRET,
    parseOptions: {},
  });

  await app.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    cookie: {
      cookieName: 'refreshtoken',
      signed: false,
    },
  });

  // Registra o plugin de autenticação
  await app.register(authPlugin);

  // Registra o roteador principal da aplicação
  await app.register(appRoutes, { prefix: '/api' });

  // Handler global de erros de validação
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.validation,
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });

  return app;
}

async function main() {
  const app = await buildServer();

  try {
    await connectToDB();

    await app.listen({ port: 3000, host: '0.0.0.0' });
    app.log.info(`Server running at http://localhost:${config.PORT}`);
    app.log.info(
      `Swagger docs available at http://localhost:${config.PORT}/docs`,
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  // Graceful shutdown
  const serverTermination = async (signal: string) => {
    app.log.info(`Received ${signal}. Shutting down gracefully...`);
    await disconnectFromDB();
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => serverTermination('SIGTERM'));
  process.on('SIGINT', () => serverTermination('SIGINT'));
}

main();
