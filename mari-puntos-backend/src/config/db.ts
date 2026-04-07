import { DataSource } from 'typeorm';
import { config } from './env';

/**
 * Strip SSL-related query params from the DATABASE_URL so that pg-connection-string
 * doesn't emit deprecation warnings about sslmode semantics.
 * SSL is configured explicitly below via the `ssl` option.
 */
function stripSslParams(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('sslmode');
    parsed.searchParams.delete('ssl');
    parsed.searchParams.delete('uselibpqcompat');
    return parsed.toString();
  } catch {
    return url;
  }
}
import { User } from '../entities/User';
import { PartnerLink } from '../entities/PartnerLink';
import { Permission } from '../entities/Permission';
import { PermissionTemplate } from '../entities/PermissionTemplate';
import { Action } from '../entities/Action';
import { Reward } from '../entities/Reward';
import { Log } from '../entities/Log';
import { Level } from '../entities/Level';
import { Achievement } from '../entities/Achievement';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  ssl: !config.isDevelopment ? { rejectUnauthorized: false } : false,
  synchronize: false, // Never use synchronize in production
  logging: config.isDevelopment,
  entities: !config.isDevelopment
    ? ['dist/entities/**/*.js']
    : [
        User,
        PartnerLink,
        Permission,
        PermissionTemplate,
        Action,
        Reward,
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
    console.log('✅ Database connection established');

    if (config.isDevelopment) {
      console.log('📊 Running in development mode - synchronize enabled');
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};
