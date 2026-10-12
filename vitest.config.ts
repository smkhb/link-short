import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const testEnv = dotenv.config({ path: '.env.test', processEnv: {} }).parsed;

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    env: testEnv,
    include: ['tests/**/*.test.ts'],
    fileParallelism: false,
  },
});
