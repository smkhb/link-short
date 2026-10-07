import { CreateUserSchema, UserResponseSchema } from '@/schemas/user.schema';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    '/register',
    {
      schema: {
        body: CreateUserSchema,
        response: {
          201: z.object({
            message: z.string(),
            status: z.string(),
            user: UserResponseSchema,
          }),
        },
      },
    },
    registerUserHandler,
  );
}
