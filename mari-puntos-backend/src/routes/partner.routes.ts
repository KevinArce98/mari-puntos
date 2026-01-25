import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const partnerController = new PartnerController();

/**
 * @swagger
 * /partner/create:
 *   post:
 *     summary: Create a new partner link
 *     description: Generate a unique partner code that can be shared with a partner to link accounts
 *     tags: [Partner]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Partner link created successfully
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
 *                     partnerCode:
 *                       type: string
 *                       example: ABC123XYZ
 *                 message:
 *                   type: string
 *                   example: Partner link created successfully
 *       400:
 *         description: User already has a partner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.post('/create', authMiddleware, asyncHandler(partnerController.createLink));

/**
 * @swagger
 * /partner/join:
 *   post:
 *     summary: Join an existing partner link
 *     description: Use a partner code to link your account with another user
 *     tags: [Partner]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerCode
 *             properties:
 *               partnerCode:
 *                 type: string
 *                 example: ABC123XYZ
 *                 description: The partner code to join
 *     responses:
 *       200:
 *         description: Successfully linked with partner
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
 *                     partner:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Successfully linked with partner
 *       400:
 *         description: Invalid partner code or user already has a partner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner code not found
 */
router.post('/join', authMiddleware, asyncHandler(partnerController.joinLink));

/**
 * @swagger
 * /partner:
 *   get:
 *     summary: Get partner information
 *     description: Retrieve information about the current user's partner
 *     tags: [Partner]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Partner information retrieved successfully
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
 *       404:
 *         description: Partner not found
 */
router.get('/', authMiddleware, asyncHandler(partnerController.getPartner));

/**
 * @swagger
 * /partner/unlink:
 *   post:
 *     summary: Unlink from partner
 *     description: Remove the link between the current user and their partner
 *     tags: [Partner]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully unlinked from partner
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
 *                   example: Successfully unlinked from partner
 *       400:
 *         description: User does not have a partner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.post('/unlink', authMiddleware, asyncHandler(partnerController.unlinkPartner));

export default router;
