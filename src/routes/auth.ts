import { CreateUserSchema, UserResponseSchema } from '@/schemas/user.schema';
import { registerUserHandler } from '@/controllers/registerUser';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    '/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'Register a new user',
        description:
          'Creates a new user account, generates a refresh token, and returns a success status.',
        body: CreateUserSchema,
        response: {
          201: z.object({
            message: z.string(),
            status: z.literal('success'),
            user: UserResponseSchema,
          }),
          403: z.object({
            message: z.string(),
            status: z.literal('error'),
          }),
          409: z.object({
            message: z.string(),
            status: z.literal('error'),
          }),
          500: z.object({
            message: z.string(),
            status: z.string(),
          }),
        },
      },
    },
    registerUserHandler,
  );
}
