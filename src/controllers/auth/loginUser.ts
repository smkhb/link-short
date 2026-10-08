import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { LoginUser } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import config from '@/config';

export const loginUserHandler = async (
  request: FastifyRequest<{ Body: LoginUser }>,
  reply: FastifyReply,
): Promise<void> => {
  const { email, password } = request.body;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      return reply.status(401).send({
        message: 'Email or password is incorrect',
        status: 'error',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(401).send({
        message: 'Email or password is incorrect',
        status: 'error',
      });
    }

    const refreshToken = generateRefreshToken({ userId: user.id });

    await db
      .update(usersTable)
      .set({ refreshToken })
      .where(eq(usersTable.email, email));

    reply.setCookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: config.COOKIE_MAX_AGE,
      secure: config.NODE_ENV === 'production',
    });

    const accessToken = generateAccessToken({ userId: user.id });

    reply.status(200).send({
      message: 'User logged in successfully',
      status: 'success',
      accessToken,
    });
  } catch (error) {
    reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while logging in the user',
    });
    reply.log.error(
      `An error occurred while logging in the user with email ${email}, ${error}`,
    );
    return;
  }
};
