import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || '',
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
  },
  
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    database: process.env.MYSQL_DB || '',
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
  },
  
  sqlite: {
    path: process.env.SQLITE_PATH || './database.sqlite',
  },
};

export function validateConfig(): void {
  if (!config.gemini.apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set. AI features will not work.');
  }
}
