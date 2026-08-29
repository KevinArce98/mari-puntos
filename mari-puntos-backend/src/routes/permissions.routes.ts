import { Router } from 'express';

import { PermissionsController } from '../controllers/permissions.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const permissionsController = new PermissionsController();

router.post('/', authMiddleware, asyncHandler(permissionsController.createPermission));

router.get('/my', authMiddleware, asyncHandler(permissionsController.getMyPermissions));

router.get(
  '/partner',
  authMiddleware,
  asyncHandler(permissionsController.getPartnerPermissions)
);

router.get('/:id', authMiddleware, asyncHandler(permissionsController.getPermissionById));

router.post(
  '/:id/respond',
  authMiddleware,
  asyncHandler(permissionsController.respondToPermission)
);

router.patch(
  '/:id',
  authMiddleware,
  asyncHandler(permissionsController.updatePermission)
);

router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(permissionsController.deletePermission)
);

export default router;
