import { createClerkClient } from '@clerk/express';

import { config } from './env';

export const clerkClient: ReturnType<typeof createClerkClient> = createClerkClient({
  secretKey: config.clerk.secretKey,
});
