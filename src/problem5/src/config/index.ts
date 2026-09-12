import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  dbPath: string;
  corsOrigin: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  dbPath:
    process.env.DB_PATH === ':memory:'
      ? ':memory:'
      : path.resolve(process.cwd(), process.env.DB_PATH || 'data/database.sqlite'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
