import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { v7 as uuidv7 } from 'uuid';
import bcrypt from 'bcrypt';
import { generateRefreshToken } from '@/lib/jwt';
import z from 'zod';

const testUserSchema = z.object({
  name: z.string().default(`I'm trying to be a user`),
  email: z.email().default('user@example.com'),
  password: z.string().min(6).default('password123'),
  role: z.enum(['user', 'admin']).default('user'),
});

export type TestUser = z.input<typeof testUserSchema>;

export const makeUser = async (overrides: TestUser = {}) => {
  const { name, email, password, role } = testUserSchema.parse(overrides);

  const userId = uuidv7();
  const hashedPassword = await bcrypt.hash(password, 10);
  const refreshToken = generateRefreshToken({ userId });

  const [user] = await db
    .insert(usersTable)
    .values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      refreshToken,
    })
    .returning();

  return { user, plainPassword: password };
};
