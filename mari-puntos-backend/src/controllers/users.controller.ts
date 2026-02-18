import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UsersService } from '../services/users.service';
import { PushNotificationService } from '../services/push-notification.service';
import {
  createUserSchema,
  updateUserSchema,
  sendTestNotificationSchema,
} from '../validators/schemas';
import { sendSuccess, sendCreated } from '../utils/response';
import { toUserDTO, toUserStatsDTO } from '../utils/mappers';
import { logger } from '../utils/logger';

export class UsersController {
  private usersService = new UsersService();
  private pushNotificationService = new PushNotificationService();

  /**
   * GET /users/profile
   * Get current user's profile
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { user, hasPartner } = await this.usersService.getUserProfile(userId);

    sendSuccess(res, toUserDTO(user, hasPartner));
  };

  /**
   * POST /users/profile
   * Create user profile (called after Clerk signup)
   */
  createProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      logger.info({
        message: 'Create profile request',
        body: req.body,
        clerkId: req.clerkId,
      });

      const data = createUserSchema.parse(req.body);
      logger.debug({ message: 'Schema validation passed', data });

      // Get clerkId from request body if provided (during signup flow)
      // Otherwise get from authenticated token (for already authenticated users)
      const clerkId = data.clerkId || req.clerkId!;
      logger.debug({ message: 'Using clerkId', clerkId });

      const user = await this.usersService.createUser({
        ...data,
        clerkId,
      });
      logger.info({ message: 'User created successfully', userId: user.id });

      sendCreated(res, toUserDTO(user, false), 'Profile created successfully');
    } catch (error) {
      logger.error({ err: error }, 'Error in createProfile');
      throw error;
    }
  };

  /**
   * PUT /users/profile
   * Update current user's profile
   */
  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    try {
      const data = updateUserSchema.parse(req.body);

      logger.info({ message: 'Updating profile for user', userId });

      const { user, hasPartner } = await this.usersService.updateUser(userId, data);

      logger.info({ message: 'Profile updated successfully for user', userId });

      sendSuccess(res, toUserDTO(user, hasPartner), 'Profile updated successfully');
    } catch (error) {
      logger.error({ err: error, userId }, 'Error updating profile for user');
      throw error;
    }
  };

  /**
   * GET /users/stats
   * Get current user's statistics
   */
  getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const stats = await this.usersService.getUserStats(userId);

    sendSuccess(res, toUserStatsDTO(stats));
  };

  /**
   * DELETE /users/profile
   * Deactivate current user's account
   */
  deactivateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    try {
      logger.info({ message: 'Deactivating account for user', userId });

      await this.usersService.deactivateUser(userId);

      logger.info({ message: 'Account deactivated successfully for user', userId });

      sendSuccess(res, null, 'Account deactivated successfully');
    } catch (error) {
      logger.error({ err: error, userId }, 'Error deactivating account for user');
      throw error;
    }
  };

  /**
   * POST /users/test-notification
   * Send a test push notification to verify the push token works
   */
  sendTestNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      logger.error({ err: error }, 'Error sending test notification');
      throw error;
    }
  };
}
