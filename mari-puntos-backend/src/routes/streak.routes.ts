import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getStreak } from '../controllers/streak.controller';

const router: Router = Router();

router.get('/', authMiddleware, getStreak);

export default router;
