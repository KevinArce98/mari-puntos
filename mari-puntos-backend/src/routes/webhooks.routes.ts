import { Router } from 'express';
import { WebhooksController } from '../controllers/webhooks.controller';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const webhooksController = new WebhooksController();

/**
 * @swagger
 * /webhooks/clerk:
 *   post:
 *     summary: Clerk webhook receiver
 *     description: >
 *       Receives user.created/user.updated/user.deleted events from Clerk and keeps
 *       the local users table in sync. Verified via Svix signature — not a user-facing
 *       endpoint, not behind authMiddleware or rateLimitMiddleware.
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Event processed
 *       400:
 *         description: Invalid webhook signature
 *       500:
 *         description: Webhook not configured, or a transient handler error (Clerk will retry)
 */
router.post('/clerk', asyncHandler(webhooksController.handleClerkWebhook));

export default router;
