import { z } from 'zod';

/**
 * Runtime schema for the `data` payload attached to push notifications.
 * Notification payloads are untrusted external input, so we validate them with
 * Zod instead of casting, guarding navigation against malformed/forged data.
 */
export const notificationDataSchema = z.object({
  type: z.enum([
    'permission_requested',
    'permission_response',
    'action_created',
    'action_approved',
    'action_rejected',
    'partner_linked',
  ]),
  approved: z.boolean().optional(),
  pointsAwarded: z.number().optional(),
});

export type NotificationData = z.infer<typeof notificationDataSchema>;

/**
 * Safely parse an unknown notification payload. Returns the typed data or null
 * when the payload is missing/invalid.
 */
export const parseNotificationData = (data: unknown): NotificationData | null => {
  const result = notificationDataSchema.safeParse(data);
  return result.success ? result.data : null;
};
