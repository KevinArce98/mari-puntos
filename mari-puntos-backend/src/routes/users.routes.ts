import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authMiddleware, clerkOnlyAuthMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const usersController = new UsersController();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authMiddleware, asyncHandler(usersController.getProfile));

/**
 *  @swagger
 * /users/profile:
 *   post:
 *     summary: Create current user profile
 *     description: Create the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [husband, wife]
 *                 example: husband
 *     responses:
 *       200:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Profile created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/profile', clerkOnlyAuthMiddleware, asyncHandler(usersController.createProfile));

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [husband, wife]
 *                 example: husband
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authMiddleware, asyncHandler(usersController.updateProfile));

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get current user statistics
 *     description: Retrieve statistics for the authenticated user including points, actions, and achievements
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                     totalPoints:
 *                       type: integer
 *                       example: 250
 *                     currentLevel:
 *                       type: integer
 *                       example: 3
 *                     pointsInCurrentLevel:
 *                       type: integer
 *                       example: 50
 *                     actionsCreated:
 *                       type: integer
 *                       example: 15
 *                     actionsApproved:
 *                       type: integer
 *                       example: 12
 *                     permissionsRequested:
 *                       type: integer
 *                       example: 5
 *                     achievementsUnlocked:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authMiddleware, asyncHandler(usersController.getStats));

/**
 * @swagger
 * /users/deactivate:
 *   post:
 *     summary: Deactivate current user account
 *     description: Deactivate the authenticated user's account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
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
 *                   example: Account deactivated successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/deactivate',
  authMiddleware,
  asyncHandler(usersController.deactivateAccount)
);

export default router;
