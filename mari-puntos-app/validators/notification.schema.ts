import { z } from 'zod';

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

export const parseNotificationData = (data: unknown): NotificationData | null => {
  const result = notificationDataSchema.safeParse(data);
  return result.success ? result.data : null;
};
