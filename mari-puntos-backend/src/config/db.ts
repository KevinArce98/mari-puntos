import { DataSource } from 'typeorm';

import { Achievement } from '../entities/Achievement';
import { Action } from '../entities/Action';
import { Level } from '../entities/Level';
import { Log } from '../entities/Log';
import { PartnerLink } from '../entities/PartnerLink';
import { Permission } from '../entities/Permission';
import { PermissionTemplate } from '../entities/PermissionTemplate';
import { User } from '../entities/User';
import { logger } from '../utils/logger';
import { config } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  ssl: !config.isDevelopment ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: config.isDevelopment,
  // Connection pool config to avoid cold-start latency under load
  extra: {
    max: 10, // max pool connections
    min: 2, // keep warm connections alive
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000, // 30s max query time before error
  },
  entities: !config.isDevelopment
    ? ['dist/entities/**/*.js']
    : [
        User,
        PartnerLink,
        Permission,
        PermissionTemplate,
        Action,
        Log,
        Level,
        Achievement,
      ],
  migrations: !config.isDevelopment
    ? ['dist/migrations/**/*.js']
    : ['src/migrations/**/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');
  } catch (error) {
    logger.error({ err: error }, 'Error connecting to database');
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error({ err: error }, 'Error closing database connection');
    throw error;
  }
};
