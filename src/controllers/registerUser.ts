import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUser } from '@/schemas/user.schema';
import config from '@/config';
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '@/lib/drizzle';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function registerUserHandler(
  request: FastifyRequest<{ Body: CreateUser }>,
  reply: FastifyReply,
): Promise<void> {
  const { name, email, password, role } = request.body;
  const db = drizzle({ client: pool });

  if (role === 'admin' && !config.WHITELISTED_EMAILS?.includes(email)) {
    request.log.warn(
      `Unauthorized admin registration attempt for email: ${email}`,
    );
    return reply.status(403).send({
      message: 'You are not authorized to register an admin',
      status: 'error',
    });
  }

  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUser.length > 0) {
    return reply.status(409).send({
      message: 'Email already exists',
      status: 'error',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const refreshToken = crypto.randomUUID().split('-')[0];
    const user = {
      name,
      email,
      password: hashedPassword,
      role,
      refreshToken,
    };

    await db.insert(usersTable).values(user);

    reply.setCookie('refreshtoken', refreshToken, {
      httpOnly: config.NODE_ENV === 'production',
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: config.COOKIE_MAX_AGE,
    });

    reply.status(201).send({
      message: 'User registered successfully',
      status: 'success',
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while registering the user',
    });
    reply.log.error(
      `An error occurred while registering the user with email ${email}, ${error}`,
    );
    return;
  }
}
