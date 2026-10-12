import { z } from 'zod';

export const UserSchema = z.object({
  id: z.uuid(),
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty'),
  email: z.email({ error: 'Email is required' }).trim(),
  password: z
    .string({ error: 'Password is required' })
    .trim()
    .min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['user', 'admin']).default('user'),
  totalVisitCount: z.number().default(0),
  passwordResetToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
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

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  passwordResetToken: true,
});

export const UpdateUserSchema = CreateUserSchema.omit({ role: true }).partial();

export const UserParamsSchema = z.object({
  id: z.uuid({ message: 'Invalid user ID' }),
});

export const UserResponseSchema = UserSchema.omit({
  deletedAt: true,
  password: true,
  refreshToken: true,
  passwordResetToken: true,
});

export const LoginUserSchema = z.object({
  email: z.email({ error: 'Email is required' }).trim(),
  password: z.string({ error: 'Password is required' }).trim(),
});

export const ForgotPasswordSchema = z.object({
  email: z.email({ error: 'Email is required' }).trim(),
});

export const ResetPasswordSchema = z.object({
  token: z.string({ error: 'Token is required' }).trim(),
  newPassword: z
    .string({ error: 'New password is required' })
    .trim()
    .min(6, 'New password must be at least 6 characters long'),
});

export const ResetPasswordWebQuerySchema = z.object({
  token: z.string({ error: 'Token is required' }).trim(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordWebQuery = z.infer<typeof ResetPasswordWebQuerySchema>;
