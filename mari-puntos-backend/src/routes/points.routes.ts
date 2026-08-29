import { Router } from 'express';

import { PointsController } from '../controllers/points.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const pointsController = new PointsController();

router.get('/history', authMiddleware, asyncHandler(pointsController.getHistory));

router.get('/leaderboard', authMiddleware, asyncHandler(pointsController.getLeaderboard));

export default router;
