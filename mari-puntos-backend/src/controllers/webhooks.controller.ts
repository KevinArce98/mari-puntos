import { Request, Response } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';
import { config } from '../config/env';
import { UsersService } from '../services/users.service';
import { logger } from '../utils/logger';

export class WebhooksController {
  private usersService = new UsersService();

  handleClerkWebhook = async (req: Request, res: Response): Promise<void> => {
    if (!config.clerk.webhookSigningSecret) {
      logger.error('CLERK_WEBHOOK_SIGNING_SECRET not configured — rejecting webhook');
      res.status(500).json({ success: false, message: 'Webhook not configured' });
      return;
    }

    let event: Awaited<ReturnType<typeof verifyWebhook>>;
    try {
      event = await verifyWebhook(req, {
        signingSecret: config.clerk.webhookSigningSecret,
      });
    } catch (err) {
      logger.warn({ err }, 'Clerk webhook signature verification failed');
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    try {
      switch (event.type) {
        case 'user.created':
        case 'user.updated': {
          const clerkId = event.data.id;
          if (clerkId) {
            await this.usersService.findOrCreateByClerkId(clerkId);
          }
          break;
        }
        case 'user.deleted': {
          const clerkId = event.data.id;
          if (clerkId) {
            await this.usersService.purgeUserByClerkId(clerkId);
          }
          break;
        }
        default:
          logger.debug({ type: event.type }, 'Unhandled Clerk webhook event type');
      }
    } catch (err) {
      logger.error({ err, type: event.type }, 'Error handling Clerk webhook event');
      res.status(500).json({ success: false, message: 'Webhook handler error' });
      return;
    }

    res.status(200).json({ success: true });
  };
}
