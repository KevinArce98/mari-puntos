import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('http://localhost'),
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Clerk
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, 'CLERK_PUBLISHABLE_KEY is required'),
  CLERK_PEM_PUBLIC_KEY: z.string().min(1, 'CLERK_PEM_PUBLIC_KEY is required'),
  CLERK_ISSUER: z.string().min(1, 'CLERK_ISSUER is required'), // e.g. https://<your-instance>.clerk.accounts.dev
  
  // App
  PARTNER_CODE_LENGTH: z.string().default('6'),
  POINTS_PER_LEVEL: z.string().default('100'),
  ALLOWED_ORIGINS: z.string().min(1, 'ALLOWED_ORIGINS is required'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

export const config = {
  port: parseInt(env.PORT, 10),
  host: env.HOST,
  nodeEnv: env.NODE_ENV,
  database: {
    url: env.DATABASE_URL,
  },
  clerk: {
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    publicKey: env.CLERK_PEM_PUBLIC_KEY,
    issuer: env.CLERK_ISSUER,
  },
  app: {
    partnerCodeLength: parseInt(env.PARTNER_CODE_LENGTH, 10),
    pointsPerLevel: parseInt(env.POINTS_PER_LEVEL, 10),
    allowedOrigins: env.ALLOWED_ORIGINS.split(','),
  },
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
};
