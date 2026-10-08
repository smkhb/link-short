import {
  camelCase,
  integer,
  pgEnum,
  pgTable,
  snakeCase,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const usersTable = snakeCase.table('users', {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: roleEnum().notNull().default('user'),
  totalVisitCount: integer().notNull().default(0), // -> total_visit_count in DB
  passwordResetToken: varchar({ length: 255 }), // -> password_reset_token in DB
  refreshToken: varchar({ length: 255 }), // -> refresh_token in DB
  updatedAt: timestamp(), // -> updated_at in DB
  createdAt: timestamp().defaultNow().notNull(), // -> created_at in DB
  deletedAt: timestamp(), // -> deleted_at in DB
});
