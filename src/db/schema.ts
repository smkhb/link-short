import { relations } from 'drizzle-orm/_relations';
import {
  integer,
  pgEnum,
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

export const linksTable = snakeCase.table('links', {
  id: uuid().primaryKey(),
  title: varchar({ length: 255 }),
  destination: varchar({ length: 2048 }).notNull(),
  backHalf: varchar({ length: 255 }).notNull().unique(),
  shortLink: varchar({ length: 2048 }).notNull(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }), // -> user_id in DB
  totalVisitCount: integer().notNull().default(0), // -> total_visit_count in DB
  updatedAt: timestamp(), // -> updated_at in DB
  createdAt: timestamp().defaultNow().notNull(), // -> created_at in DB
  deletedAt: timestamp(), // -> deleted_at in DB
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  links: many(linksTable),
}));

export const linksRelations = relations(linksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [linksTable.userId],
    references: [usersTable.id],
  }),
}));
