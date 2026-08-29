import { Router } from 'express';

import { UsersController } from '../controllers/users.controller';
import { authMiddleware, clerkOnlyAuthMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const usersController = new UsersController();

router.get('/profile', authMiddleware, asyncHandler(usersController.getProfile));

router.post(
  '/profile',
  clerkOnlyAuthMiddleware,
  asyncHandler(usersController.createProfile)
);

router.put('/profile', authMiddleware, asyncHandler(usersController.updateProfile));

router.get('/stats', authMiddleware, asyncHandler(usersController.getStats));
router.get(
  '/achievements',
  authMiddleware,
  asyncHandler(usersController.getAchievements)
);

router.delete('/account', authMiddleware, asyncHandler(usersController.deleteAccount));

router.post(
  '/deactivate',
  authMiddleware,
  asyncHandler(usersController.deactivateAccount)
);

router.post(
  '/test-notification',
  authMiddleware,
  asyncHandler(usersController.sendTestNotification)
);

export default router;
