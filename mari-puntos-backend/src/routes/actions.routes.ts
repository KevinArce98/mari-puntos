import { Router } from 'express';

import { ActionsController } from '../controllers/actions.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const actionsController = new ActionsController();

router.post('/', authMiddleware, asyncHandler(actionsController.createAction));

router.get('/my', authMiddleware, asyncHandler(actionsController.getMyActions));

router.get('/partner', authMiddleware, asyncHandler(actionsController.getPartnerActions));

router.get('/:id', authMiddleware, asyncHandler(actionsController.getActionById));

router.put('/:id', authMiddleware, asyncHandler(actionsController.updateAction));

router.post(
  '/:id/approve',
  authMiddleware,
  asyncHandler(actionsController.approveAction)
);

router.post('/:id/reject', authMiddleware, asyncHandler(actionsController.rejectAction));

router.delete('/:id', authMiddleware, asyncHandler(actionsController.deleteAction));

export default router;
