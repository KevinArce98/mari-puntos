import 'reflect-metadata';

import { createApp } from './app';
import { closeDatabase, initializeDatabase } from './config/db';
import { config } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await initializeDatabase();
    logger.info('Database initialized');

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info('');
      logger.info('🚀 MariPuntos API Server Started');
      logger.info('================================');
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Server running on port ${config.port}`);
      logger.info(`🔗 API URL: ${config.host}:${config.port}/api`);
      logger.info(`💚 Health check: ${config.host}:${config.port}/api/health`);
      if (config.isDevelopment) {
        logger.info(`📚 Swagger docs: ${config.host}:${config.port}/api-docs`);
      }
      logger.info('================================');
      logger.info('');
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeDatabase();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error({ err: error }, 'Error during shutdown');
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error({ err: error }, 'Uncaught Exception');
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ promise, reason }, 'Unhandled Rejection at');
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
