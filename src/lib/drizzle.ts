import config from '@/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle({ client: pool });

const connectToDB = async () => {
  try {
    await pool.query('select 1');
    console.log('Connected to the database successfully.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

const disconnectFromDB = async () => {
  try {
    await pool.end();
    console.log('Disconnected from the database successfully.');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
  }
};

export { connectToDB, disconnectFromDB };
