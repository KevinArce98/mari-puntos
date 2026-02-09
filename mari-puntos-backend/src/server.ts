import 'reflect-metadata';
import { createApp } from './app';
import { config } from './config/env';
import { initializeDatabase, closeDatabase } from './config/db';
import { RewardsService } from './services/rewards.service';

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Seed default rewards
    const rewardsService = new RewardsService();
    await rewardsService.seedDefaultRewards();
    console.log('✅ Default rewards seeded');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('🚀 MariPuntos API Server Started');
      console.log('================================');
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Server running on port ${config.port}`);
      console.log(`🔗 API URL: ${config.host}:${config.port}/api`);
      console.log(`💚 Health check: ${config.host}:${config.port}/api/health`);
      if (config.isDevelopment) {
        console.log(`📚 Swagger docs: ${config.host}:${config.port}/api-docs`);
      }
      console.log('================================');
      console.log('');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          await closeDatabase();
          console.log('✅ Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
