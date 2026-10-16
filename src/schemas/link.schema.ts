import z from 'zod';

export const LinkSchema = z.object({
  title: z.string().optional(),
  destination: z.url({ message: 'Destination URL is required' }),
  backHalf: z.string().optional(),
  shortLink: z.url(),
  creator: z.uuid(),
  totalVisitCount: z.number().int().nonnegative().default(0),
  createdAt: z.union([z.date(), z.string(), z.iso.datetime()]),
  updatedAt: z
    .union([z.date(), z.string(), z.iso.datetime()])
    .nullable()
    .optional(),
  deletedAt: z
    .union([z.date(), z.string(), z.iso.datetime()])
    .nullable()
    .optional(),
});

export const CreateLinkSchema = LinkSchema.omit({
  creator: true,
  shortLink: true,
  totalVisitCount: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const UpdateLinkSchema = CreateLinkSchema.partial();

export const LinkResponseSchema = LinkSchema.omit({
  creator: true,
  deletedAt: true,
});

export type CreateLink = z.infer<typeof CreateLinkSchema>;
export type UpdateLink = z.infer<typeof UpdateLinkSchema>;
export type LinkResponse = z.infer<typeof LinkResponseSchema>;
