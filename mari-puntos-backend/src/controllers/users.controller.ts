import { Response } from 'express';

import { AuthRequest } from '../middlewares/authMiddleware';
import { PushNotificationService } from '../services/push-notification.service';
import { UsersService } from '../services/users.service';
import { logger } from '../utils/logger';
import { toAchievementDTOList, toUserDTO, toUserStatsDTO } from '../utils/mappers';
import { sendCreated, sendSuccess } from '../utils/response';
import {
  createUserSchema,
  sendTestNotificationSchema,
  updateUserSchema,
} from '../validators/schemas';

export class UsersController {
  private usersService = new UsersService();
  private pushNotificationService = new PushNotificationService();

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { user, hasPartner } = await this.usersService.getUserProfile(userId);

    sendSuccess(res, toUserDTO(user, hasPartner));
  };

  createProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    logger.info({
      message: 'Create profile request',
      clerkId: req.clerkId,
    });

    const data = createUserSchema.parse(req.body);
    logger.debug({ message: 'Schema validation passed' });

    const clerkId = req.clerkId!;

    const user = await this.usersService.createUser(clerkId, data);
    logger.info({ message: 'User created successfully', userId: user.id });

    sendCreated(res, toUserDTO(user, false), 'Profile created successfully');
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const data = updateUserSchema.parse(req.body);

    logger.info({ message: 'Updating profile for user', userId });

    const { user, hasPartner } = await this.usersService.updateUser(userId, data);

    logger.info({ message: 'Profile updated successfully for user', userId });

    sendSuccess(res, toUserDTO(user, hasPartner), 'Profile updated successfully');
  };

  getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const stats = await this.usersService.getUserStats(userId);

    sendSuccess(res, toUserStatsDTO(stats));
  };

  getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const achievements = await this.usersService.getUserAchievements(userId);
    sendSuccess(res, toAchievementDTOList(achievements));
  };

  deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    logger.info({ message: 'Permanently deleting account for user', userId });
    await this.usersService.deleteAccount(userId);
    logger.info({ message: 'Account permanently deleted for user', userId });
    sendSuccess(res, null, 'Account deleted successfully');
  };

  deactivateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    logger.info({ message: 'Deactivating account for user', userId });

    await this.usersService.deactivateUser(userId);

    logger.info({ message: 'Account deactivated successfully for user', userId });

    sendSuccess(res, null, 'Account deactivated successfully');
  };

  sendTestNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    const { pushToken, title, body, data } = sendTestNotificationSchema.parse(req.body);

    logger.info({ message: 'Sending test notification to pushToken', pushToken });

    await this.pushNotificationService.sendNotification(pushToken, {
      title: title || '🔔 Notificación de Prueba',
      body: body || 'Tu token de notificaciones está funcionando correctamente!',
      data: data || {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });

    logger.info({
      message: 'Test notification sent successfully to pushToken',
      pushToken,
    });

    sendSuccess(res, null, 'Test notification sent successfully');
  };
}
