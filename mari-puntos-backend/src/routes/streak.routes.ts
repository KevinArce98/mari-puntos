import { Router } from 'express';

import { getStreak } from '../controllers/streak.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();

router.get('/', authMiddleware, asyncHandler(getStreak));

export default router;
