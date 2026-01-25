import { Router } from 'express';
import { PointsController } from '../controllers/points.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const pointsController = new PointsController();

/**
 * @swagger
 * /points/history:
 *   get:
 *     summary: Get points history for current user
 *     description: Retrieve the complete points transaction history for the authenticated user
 *     tags: [Points]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Points history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       points:
 *                         type: integer
 *                         example: 10
 *                       type:
 *                         type: string
 *                         enum: [earned, spent, bonus, penalty]
 *                         example: earned
 *                       source:
 *                         type: string
 *                         example: Action approved
 *                       sourceId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/history', authMiddleware, asyncHandler(pointsController.getHistory));

/**
 * @swagger
 * /points/leaderboard:
 *   get:
 *     summary: Get points leaderboard
 *     description: Retrieve the leaderboard showing top users by points
 *     tags: [Points]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       totalPoints:
 *                         type: integer
 *                         example: 250
 *                       currentLevel:
 *                         type: integer
 *                         example: 3
 *                       rank:
 *                         type: integer
 *                         example: 1
 *       401:
 *         description: Unauthorized
 */
router.get('/leaderboard', authMiddleware, asyncHandler(pointsController.getLeaderboard));

export default router;
