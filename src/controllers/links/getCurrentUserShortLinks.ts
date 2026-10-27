import config from '@/config';
import { linksTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { RequestQuery } from '@/types';
import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function getCurrentUserShortLinksHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.user;
  const baseUrl = `${config.CLIENT_URL}/api/link/my-links`;

  const {
    search,
    sortBy = 'createdAt',
    order = 'desc',
    offset = 0,
    limit = 5,
  } = request.query as RequestQuery;
  const pageSize = Math.min(Math.max(Number(limit) || 5, 1), 50);
  const currentOffset = Math.max(Number(offset) || 0, 0);

  const targetColumn =
    sortBy === 'title'
      ? linksTable.title
      : sortBy === 'destination'
        ? linksTable.destination
        : linksTable.createdAt;
  const orderClause = order === 'asc' ? asc(targetColumn) : desc(targetColumn);

  const buildPageUrl = (pageOffset: number): string => {
    const params = new URLSearchParams({
      offset: String(pageOffset),
      limit: String(pageSize),
      sortBy,
      order,
    });
    if (search) params.set('search', search);
    return `${baseUrl}?${params.toString()}`;
  };

  try {
    const rawResults = await db
      .select()
      .from(linksTable)
      .where(
        and(
          eq(linksTable.userId, userId),
          search ? ilike(linksTable.title, `%${search}%`) : undefined,
        ),
      )
      .orderBy(orderClause)
      .limit(pageSize + 1)
      .offset(currentOffset);

    const hasNextPage = rawResults.length > pageSize;

    const links = hasNextPage ? rawResults.slice(0, pageSize) : rawResults;

    const previous =
      currentOffset <= 0
        ? null
        : buildPageUrl(Math.max(currentOffset - pageSize, 0));

    const next = hasNextPage ? buildPageUrl(currentOffset + pageSize) : null;

    reply.status(200).send({
      message: 'Short links retrieved successfully',
      status: 'success',
      data: {
        previous,
        next,
        links,
      },
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while retrieving the short link',
    });
    reply.log.error(`Error retrieving short link: ${error}`);
    return;
  }
}
