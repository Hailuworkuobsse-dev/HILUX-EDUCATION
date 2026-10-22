import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

async function main() {
  // Fail fast if the DB is not reachable
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('âœ… Database connection OK');
  } catch (err) {
    logger.error({ err }, 'âŒ Database connection failed');
    logger.error('Make sure MySQL is running and DATABASE_URL is correct.');
    logger.error('Run: npm run db:up   (then wait a few seconds for MySQL to be ready)');
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`íº€ ExamPrep API listening on http://localhost:${env.PORT}`);
    logger.info(`   Health: http://localhost:${env.PORT}/api/health`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefullyâ€¦');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => {
      logger.warn('Forcing shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
