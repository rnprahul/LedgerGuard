import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CLIENT_URL: string;
  MONGO_BASE_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const env: EnvironmentConfig = {
  PORT: getEnvNumber('PORT', 5000),
  NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGO_BASE_URI: process.env.MONGO_BASE_URI || 'mongodb://127.0.0.1:27017',
  JWT_SECRET: process.env.JWT_SECRET || 'ledgerguard_dev_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
};

// Validate critical config in non-test environments
if (!env.JWT_SECRET) {
  throw new Error('CRITICAL CONFIG ERROR: JWT_SECRET must be defined in environment.');
}
