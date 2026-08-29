import { Router } from 'express';

import { getStreak } from '../controllers/streak.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/', authMiddleware, getStreak);

export default router;
