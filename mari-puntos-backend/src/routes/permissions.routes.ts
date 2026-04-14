import { Router } from 'express';
import { PermissionsController } from '../controllers/permissions.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const permissionsController = new PermissionsController();

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a new permission request
 *     description: Create a permission request that requires approval from your partner
 *     tags: [Permissions]
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
 *               - type
 *               - requestedDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: Gaming night with friends
 *               description:
 *                 type: string
 *                 example: Want to play video games with the guys
 *               type:
 *                 type: string
 *                 enum: [night_out, gaming_session, sports_event, friends_hangout, hobby_time, other]
 *                 example: gaming_session
 *               requestedDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-15T19:00:00Z
 *               durationHours:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               pointsCost:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *     responses:
 *       201:
 *         description: Permission request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: Permission request created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Must have a partner to create permission requests
 */
router.post('/', authMiddleware, asyncHandler(permissionsController.createPermission));

/**
 * @swagger
 * /permissions/my:
 *   get:
 *     summary: Get current user's permission requests
 *     description: Retrieve all permission requests created by the authenticated user
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Permission requests retrieved successfully
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
 *                     $ref: '#/components/schemas/Permission'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authMiddleware, asyncHandler(permissionsController.getMyPermissions));

/**
 * @swagger
 * /permissions/partner:
 *   get:
 *     summary: Get partner's permission requests
 *     description: Retrieve all permission requests from your partner
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Partner's permission requests retrieved successfully
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
 *                     $ref: '#/components/schemas/Permission'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found
 */
router.get('/partner', authMiddleware, asyncHandler(permissionsController.getPartnerPermissions));

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     description: Retrieve a specific permission request by its ID
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Permission not found
 */
router.get('/:id', authMiddleware, asyncHandler(permissionsController.getPermissionById));

/**
 * @swagger
 * /permissions/{id}/respond:
 *   post:
 *     summary: Respond to permission request
 *     description: Approve or reject a permission request from your partner
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to approve or reject the permission
 *               responseMessage:
 *                 type: string
 *                 example: Have fun! Be home by midnight
 *                 description: Optional message to include with the response
 *     responses:
 *       200:
 *         description: Permission response recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: Permission approved successfully
 *       400:
 *         description: Validation error or permission already responded to
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only respond to your partner's permissions
 *       404:
 *         description: Permission not found
 */
router.post('/:id/respond', authMiddleware, asyncHandler(permissionsController.respondToPermission));

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete permission request
 *     description: Delete a permission request (Owner only, only pending permissions can be deleted)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
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
 *                   example: Permission deleted successfully
 *       400:
 *         description: Permission cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can delete permission
 *       404:
 *         description: Permission not found
 */
router.patch('/:id', authMiddleware, asyncHandler(permissionsController.updatePermission));

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete/cancel a pending permission request
 *     description: Delete a permission request. Only pending permissions can be deleted.
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Permission deleted successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: Permission deleted successfully
 *       400:
 *         description: Permission cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can delete permission
 *       404:
 *         description: Permission not found
 */
router.delete('/:id', authMiddleware, asyncHandler(permissionsController.deletePermission));

export default router;
