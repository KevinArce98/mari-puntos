import { Router } from 'express';
import { ActionsController } from '../controllers/actions.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const actionsController = new ActionsController();

/**
 * @swagger
 * /actions:
 *   post:
 *     summary: Create a new action
 *     description: Create a new action that can be approved for points (Husband only)
 *     tags: [Actions]
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
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Washed the dishes
 *               description:
 *                 type: string
 *                 example: Cleaned all the dishes after dinner
 *               category:
 *                 type: string
 *                 enum: [household, childcare, errands, romantic, personal_growth, other]
 *                 example: household
 *     responses:
 *       201:
 *         description: Action created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Action'
 *                 message:
 *                   type: string
 *                   example: Action created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only husband can create actions
 */
router.post('/', authMiddleware, asyncHandler(actionsController.createAction));

/**
 * @swagger
 * /actions/my:
 *   get:
 *     summary: Get current user's actions
 *     description: Retrieve all actions created by the authenticated user
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Actions retrieved successfully
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
 *                     $ref: '#/components/schemas/Action'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authMiddleware, asyncHandler(actionsController.getMyActions));

/**
 * @swagger
 * /actions/partner:
 *   get:
 *     summary: Get partner's actions
 *     description: Retrieve all actions created by the partner (Wife only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Partner's actions retrieved successfully
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
 *                     $ref: '#/components/schemas/Action'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only wife can view partner's actions
 *       404:
 *         description: Partner not found
 */
router.get('/partner', authMiddleware, asyncHandler(actionsController.getPartnerActions));

/**
 * @swagger
 * /actions/{id}:
 *   get:
 *     summary: Get action by ID
 *     description: Retrieve a specific action by its ID
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Action ID
 *     responses:
 *       200:
 *         description: Action retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Action'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Action not found
 */
router.get('/:id', authMiddleware, asyncHandler(actionsController.getActionById));

/**
 * @swagger
 * /actions/{id}:
 *   put:
 *     summary: Update action
 *     description: Update an action (Owner only, only pending actions can be updated)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Action ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Washed the dishes and cleaned the kitchen
 *               description:
 *                 type: string
 *                 example: Cleaned all the dishes after dinner and wiped counters
 *               category:
 *                 type: string
 *                 enum: [household, childcare, errands, romantic, personal_growth, other]
 *                 example: household
 *     responses:
 *       200:
 *         description: Action updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Action'
 *                 message:
 *                   type: string
 *                   example: Action updated successfully
 *       400:
 *         description: Validation error or action cannot be updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can update action
 *       404:
 *         description: Action not found
 */
router.put('/:id', authMiddleware, asyncHandler(actionsController.updateAction));

/**
 * @swagger
 * /actions/{id}/approve:
 *   post:
 *     summary: Approve action and award points
 *     description: Approve an action and award points to the user (Wife only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Action ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pointsAwarded
 *             properties:
 *               pointsAwarded:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *                 description: Points to award for this action
 *     responses:
 *       200:
 *         description: Action approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Action'
 *                 message:
 *                   type: string
 *                   example: Action approved successfully
 *       400:
 *         description: Validation error or action already processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only wife can approve actions
 *       404:
 *         description: Action not found
 */
router.post('/:id/approve', authMiddleware, asyncHandler(actionsController.approveAction));

/**
 * @swagger
 * /actions/{id}/reject:
 *   post:
 *     summary: Reject action
 *     description: Reject an action with an optional reason (Wife only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Action ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 example: This was not completed properly
 *     responses:
 *       200:
 *         description: Action rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Action'
 *                 message:
 *                   type: string
 *                   example: Action rejected successfully
 *       400:
 *         description: Action already processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only wife can reject actions
 *       404:
 *         description: Action not found
 */
router.post('/:id/reject', authMiddleware, asyncHandler(actionsController.rejectAction));

/**
 * @swagger
 * /actions/{id}:
 *   delete:
 *     summary: Delete action
 *     description: Delete an action (Owner only, only pending actions can be deleted)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Action ID
 *     responses:
 *       200:
 *         description: Action deleted successfully
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
 *                   example: Action deleted successfully
 *       400:
 *         description: Action cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only owner can delete action
 *       404:
 *         description: Action not found
 */
router.delete('/:id', authMiddleware, asyncHandler(actionsController.deleteAction));

export default router;
