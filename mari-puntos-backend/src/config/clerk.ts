import { createClerkClient } from '@clerk/express';
import { config } from './env';

/**
 * Clerk Backend SDK Client
 * Used for server-side operations like updating user profiles
 */
export const clerkClient: ReturnType<typeof createClerkClient> = createClerkClient({
  secretKey: config.clerk.secretKey,
});
