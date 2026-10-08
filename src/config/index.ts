import dotenv from 'dotenv';

dotenv.config();

const CORS_WHITELIST = [
  'http://localhost:3000',
  'http://localhost:3333',
  'http://localhost:5173',
];

const _1H_IN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const _7D_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const config = {
  PORT: process.env.PORT!,
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV!,
  CORS_WHITELIST,
  WINDOW_MS: _1H_IN_MS,
  COOKIE_MAX_AGE: _7D_IN_MS,
  WHITELISTED_EMAILS: process.env.WHITELISTED_EMAILS?.split(','),
  COOKIE_SECRET: process.env.COOKIE_SECRET!,
  JWT_SECRET: process.env.JWT_SECRET!,
};

export default config;
