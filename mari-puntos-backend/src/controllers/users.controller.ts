import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UsersService } from '../services/users.service';
import { PushNotificationService } from '../services/push-notification.service';
import { createUserSchema, updateUserSchema, sendTestNotificationSchema } from '../validators/schemas';
import { sendSuccess, sendCreated } from '../utils/response';
import { toUserDTO, toUserStatsDTO } from '../utils/mappers';

export class UsersController {
  private usersService = new UsersService();
  private pushNotificationService = new PushNotificationService();

  /**
   * GET /users/profile
   * Get current user's profile
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { user, hasPartner } = await this.usersService.getUserProfile(userId);

      sendSuccess(res, toUserDTO(user, hasPartner));
    } catch (error) {
      throw error;
    }
  };

  /**
   * POST /users/profile
   * Create user profile (called after Clerk signup)
   */
  createProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = createUserSchema.parse(req.body);
      
      // Get clerkId from authenticated token, not from request body (more secure)
      const clerkId = req.clerkId!;

      const user = await this.usersService.createUser({
        ...data,
        clerkId,
      });

      sendCreated(res, toUserDTO(user, false), 'Profile created successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * PUT /users/profile
   * Update current user's profile
   */
  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const data = updateUserSchema.parse(req.body);

      const { user, hasPartner } = await this.usersService.updateUser(userId, data);

      sendSuccess(res, toUserDTO(user, hasPartner), 'Profile updated successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /users/stats
   * Get current user's statistics
   */
  getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const stats = await this.usersService.getUserStats(userId);

      sendSuccess(res, toUserStatsDTO(stats));
    } catch (error) {
      throw error;
    }
  };

  /**
   * DELETE /users/profile
   * Deactivate current user's account
   */
  deactivateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      await this.usersService.deactivateUser(userId);

      sendSuccess(res, null, 'Account deactivated successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * POST /users/test-notification
   * Send a test push notification to verify the push token works
   */
  sendTestNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pushToken } = sendTestNotificationSchema.parse(req.body);

      await this.pushNotificationService.sendNotification(pushToken, {
        title: '🔔 Notificación de Prueba',
        body: 'Tu token de notificaciones está funcionando correctamente!',
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
      });

      sendSuccess(res, null, 'Test notification sent successfully');
    } catch (error) {
      throw error;
    }
  };
}
