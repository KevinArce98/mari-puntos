import { DataSource } from 'typeorm';
import { config } from './env';
import { User } from '../entities/User';
import { PartnerLink } from '../entities/PartnerLink';
import { Permission } from '../entities/Permission';
import { Action } from '../entities/Action';
import { Reward } from '../entities/Reward';
import { Log } from '../entities/Log';
import { Level } from '../entities/Level';
import { Achievement } from '../entities/Achievement';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  ssl: config.isProduction ? { rejectUnauthorized: false } : false,
  synchronize: config.isDevelopment, // Only in development
  logging: config.isDevelopment,
  entities: [User, PartnerLink, Permission, Action, Reward, Log, Level, Achievement],
  migrations: ['src/migrations/**/*.ts'],
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
