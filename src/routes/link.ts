import { generateShortLinkHandler } from '@/controllers/links/generateShortLink';
import { CreateLinkSchema, LinkResponseSchema } from '@/schemas/link.schema';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export async function linkRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    '/generate-link',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['link'],
        summary: 'Generate a link for the current user',
        description:
          'Generates a unique link for the currently authenticated user based on the session.',
        body: CreateLinkSchema,
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
            link: LinkResponseSchema,
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
    generateShortLinkHandler,
  );
}
