import { Router } from 'express';

import { WebhooksController } from '../controllers/webhooks.controller';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const webhooksController = new WebhooksController();

router.post('/clerk', asyncHandler(webhooksController.handleClerkWebhook));

export default router;
