import {
  CreateUserSchema,
  ForgotPasswordSchema,
  LoginUserSchema,
  UserResponseSchema,
} from '@/schemas/user.schema';
import { registerUserHandler } from '@/controllers/auth/registerUser';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { loginUserHandler } from '@/controllers/auth/loginUser';
import fastifyRateLimit from '@/lib/rate-limit';
import { refreshTokenHandler } from '@/controllers/auth/refreshToken';
import { logoutUserHandler } from '@/controllers/auth/logoutUser';
import { forgotPasswordHandler } from '@/controllers/auth/forgotPassword';

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

  server.post(
    '/login',
    {
      config: {
        rateLimit: fastifyRateLimit('auth'),
      },
      schema: {
        tags: ['auth'],
        summary: 'Login a user',
        description:
          'Authenticates a user, generates a access token, and returns a success status.',
        body: LoginUserSchema,
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
            accessToken: z.string(),
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
    loginUserHandler,
  );

  server.get(
    '/refresh-token',
    {
      schema: {
        tags: ['auth'],
        summary: 'Refresh access token',
        description:
          'Generates a new access token using the refresh token stored in the cookie.',
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
            accessToken: z.string(),
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
    refreshTokenHandler,
  );

  server.delete(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        summary: 'Logout a user',
        description:
          'Clears the refresh token cookie, effectively logging the user out.',
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
          }),
          500: z.object({
            message: z.string(),
            status: z.string(),
          }),
        },
      },
    },
    logoutUserHandler,
  );

  server.post(
    '/forgot-password',
    {
      config: {
        rateLimit: fastifyRateLimit('auth'),
      },
      schema: {
        tags: ['auth'],
        summary: 'Forgot password',
        description:
          'Sends a password reset email to the user with a reset token.',
        body: ForgotPasswordSchema,
        response: {
          200: z.object({
            message: z.string(),
            status: z.literal('success'),
          }),
          500: z.object({
            message: z.string(),
            status: z.string(),
          }),
        },
      },
    },
    forgotPasswordHandler,
  );
}
