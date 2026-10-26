import { redirectHandler } from '@/controllers/redirect/redirect';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export async function redirectRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/:backHalf',
    {
      schema: {
        tags: ['redirect'],
        summary: 'Redirect to the original URL based on the back half',
        description:
          'Redirects the user to the original URL associated with the provided back half of the shortened link.',
        params: z.object({
          backHalf: z.string().min(1, 'Back half is required'),
        }),
        response: {
          302: z.url(),
          500: z.object({
            message: z.string(),
            status: z.string(),
          }),
        },
      },
    },
    redirectHandler,
  );
}
