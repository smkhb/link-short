import { getCurrentUserHandler } from '@/controllers/user/getCurrentUser';
import { UserResponseSchema } from '@/schemas/user.schema';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export async function userRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/current',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['user'],
        summary: 'Get the current user',
        description:
          'Returns the currently authenticated user based on the session.',
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
            user: UserResponseSchema,
          }),
          401: z.object({
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
    getCurrentUserHandler,
  );
}
