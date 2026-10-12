import { buildServer } from './app';
import config from './config';
import { connectToDB, disconnectFromDB } from './lib/drizzle';

(async function (): Promise<void> {
  const app = await buildServer();

  try {
    await connectToDB();

    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    app.log.info(`Server running at http://localhost:${config.PORT}/api`);
    app.log.info(
      `Swagger docs available at http://localhost:${config.PORT}/api/docs`,
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const serverTermination = async (signal: string) => {
    app.log.info(`Received ${signal}. Shutting down gracefully...`);
    await disconnectFromDB();
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => serverTermination('SIGTERM'));
  process.on('SIGINT', () => serverTermination('SIGINT'));
})();
