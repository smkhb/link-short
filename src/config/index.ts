import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT!,
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV!,
};

export default config;
