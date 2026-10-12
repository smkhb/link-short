import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';

export const clearDatabase = async () => {
  await db.delete(usersTable).execute();
};
