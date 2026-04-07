import 'reflect-metadata';
import { createApp } from './app';
import { config } from './config/env';
import { initializeDatabase, closeDatabase } from './config/db';
import { RewardsService } from './services/rewards.service';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized');

    // Seed default rewards
    const rewardsService = new RewardsService();
    await rewardsService.seedDefaultRewards();
    logger.info('Default rewards seeded');

    // Create Express app
    const app = createApp();

    // Start server
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

    // Graceful shutdown
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

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
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

// Start the server
startServer();
