import cors from '@fastify/cors';
import config from './config';
import rateLimit from '@fastify/rate-limit';
import fastifyJwt from '@fastify/jwt';
import corsOptions from './lib/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyRateLimit from './lib/rate-limit';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { ZodError } from 'zod';
import { appRoutes } from './routes';
import { authPlugin } from './plugins/auth';
import Fastify, { FastifyError } from 'fastify';

export async function buildServer() {
  // Cria uma instância do Fastify com suporte a logs e ao Zod
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
  
  // Configura o Swagger e Swagger UI
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Link Shortener API',
        description: 'API documentation for the Link Shortener service',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}/api`,
          description: 'Local server',
        },
      ],
    },
    transform: jsonSchemaTransform,
  });
  await app.register(fastifySwaggerUi, { routePrefix: '/api/docs' });

  // Configura os compiladores do Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Configura CORS e Rate Limit
  await app.register(cors, corsOptions);
  await app.register(rateLimit, fastifyRateLimit('basic'));

  // Registra o plugin de autenticação
  await app.register(authPlugin);

  // Registra o roteador principal da aplicação
  await app.register(appRoutes, { prefix: '/api' });

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
    reply.log.error({ error }, 'Internal server error occurred');
    return reply.status(statusCode).send({
      code: error.code || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  });

  return app;
}
