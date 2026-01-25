import { Router } from 'express';
import { RewardsController } from '../controllers/rewards.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const rewardsController = new RewardsController();

/**
 * @swagger
 * /rewards:
 *   post:
 *     summary: Create a new custom reward
 *     description: Create a custom reward that can be redeemed with points
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - pointsCost
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Movie night of my choice
 *               description:
 *                 type: string
 *                 example: Get to pick the movie for date night
 *               category:
 *                 type: string
 *                 enum: [personal_time, entertainment, gifts, experiences, privileges, other]
 *                 example: entertainment
 *               pointsCost:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50
 *               requiredLevel:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Reward created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *                 message:
 *                   type: string
 *                   example: Reward created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, asyncHandler(rewardsController.createReward));

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: Get all rewards
 *     description: Retrieve all available rewards (both default and custom)
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Rewards retrieved successfully
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
 *                     $ref: '#/components/schemas/Reward'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, asyncHandler(rewardsController.getAllRewards));

/**
 * @swagger
 * /rewards/available:
 *   get:
 *     summary: Get rewards available for current user
 *     description: Retrieve rewards that the user can afford and has the required level for
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Available rewards retrieved successfully
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
 *                     $ref: '#/components/schemas/Reward'
 *       401:
 *         description: Unauthorized
 */
router.get('/available', authMiddleware, asyncHandler(rewardsController.getAvailableRewards));

/**
 * @swagger
 * /rewards/{id}:
 *   get:
 *     summary: Get reward by ID
 *     description: Retrieve a specific reward by its ID
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reward not found
 */
router.get('/:id', authMiddleware, asyncHandler(rewardsController.getRewardById));

/**
 * @swagger
 * /rewards/redeem:
 *   post:
 *     summary: Redeem a reward
 *     description: Redeem a reward by spending points
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewardId
 *             properties:
 *               rewardId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *                 description: ID of the reward to redeem
 *     responses:
 *       200:
 *         description: Reward redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reward:
 *                       $ref: '#/components/schemas/Reward'
 *                     remainingPoints:
 *                       type: integer
 *                       example: 150
 *                 message:
 *                   type: string
 *                   example: Reward redeemed successfully
 *       400:
 *         description: Insufficient points or reward not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reward not found
 */
router.post('/redeem', authMiddleware, asyncHandler(rewardsController.redeemReward));

/**
 * @swagger
 * /rewards/{id}:
 *   put:
 *     summary: Update reward
 *     description: Update a custom reward (only custom rewards can be updated)
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reward ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated movie night
 *               description:
 *                 type: string
 *                 example: Updated description
 *               category:
 *                 type: string
 *                 enum: [personal_time, entertainment, gifts, experiences, privileges, other]
 *                 example: entertainment
 *               pointsCost:
 *                 type: integer
 *                 minimum: 1
 *                 example: 75
 *               requiredLevel:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Reward updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *                 message:
 *                   type: string
 *                   example: Reward updated successfully
 *       400:
 *         description: Validation error or cannot update default reward
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reward not found
 */
router.put('/:id', authMiddleware, asyncHandler(rewardsController.updateReward));

/**
 * @swagger
 * /rewards/{id}:
 *   delete:
 *     summary: Delete reward
 *     description: Delete a custom reward (only custom rewards can be deleted)
 *     tags: [Rewards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reward deleted successfully
 *       400:
 *         description: Cannot delete default reward
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reward not found
 */
router.delete('/:id', authMiddleware, asyncHandler(rewardsController.deleteReward));

export default router;
