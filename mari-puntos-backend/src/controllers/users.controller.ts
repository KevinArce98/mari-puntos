import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UsersService } from '../services/users.service';
import { createUserSchema, updateUserSchema } from '../validators/schemas';
import { sendSuccess, sendCreated } from '../utils/response';
import { toUserDTO, toUserStatsDTO } from '../utils/mappers';

export class UsersController {
  private usersService = new UsersService();

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
      const clerkId = req.clerkId!;
      const data = createUserSchema.parse(req.body);

      const user = await this.usersService.createUser(clerkId, data);

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
}
