import { buildServer } from '@/app';

export const buildTestApp = async () => {
  const app = await buildServer();
  await app.ready();
  return app;
};
