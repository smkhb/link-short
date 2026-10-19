import { deleteUserShortLinkHandler } from '@/controllers/links/deleteUserShortLink';
import { generateShortLinkHandler } from '@/controllers/links/generateShortLink';
import { getCurrentUserShortLinksHandler } from '@/controllers/links/getCurrentUserShortLinks';
import { updateUserShortLinkHandler } from '@/controllers/links/updateUserShortLink';
import {
  CreateLinkSchema,
  LinkResponseSchema,
  UpdateLinkSchema,
} from '@/schemas/link.schema';
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

  server.get(
    '/my-links',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['link'],
        summary: 'Get all links for the current user',
        description:
          'Retrieves all links associated with the currently authenticated user based on the session.',
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
            links: z.array(LinkResponseSchema),
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
    getCurrentUserShortLinksHandler,
  );

  server.patch(
    '/my-links/:linkId',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['link'],
        summary: 'Update a link for the current user',
        description:
          'Updates a specific link associated with the currently authenticated user based on the session.',
        params: z.object({
          linkId: z.uuid({ message: 'Invalid link ID' }),
        }),
        body: UpdateLinkSchema,
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
            link: LinkResponseSchema,
          }),
          400: z.object({
            message: z.string(),
            status: z.literal('error'),
          }),
          401: z.object({
            message: z.string(),
            status: z.literal('error'),
          }),
          404: z.object({
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
    updateUserShortLinkHandler,
  );

  server.delete(
    '/my-links/:linkId',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['link'],
        summary: 'Delete a link for the current user',
        description:
          'Deletes a specific link associated with the currently authenticated user based on the session.',
        params: z.object({
          linkId: z.uuid({ message: 'Invalid link ID' }),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
          }),
          400: z.object({
            message: z.string(),
            status: z.literal('error'),
          }),
          401: z.object({
            message: z.string(),
            status: z.literal('error'),
          }),
          404: z.object({
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
    deleteUserShortLinkHandler,
  );
}
