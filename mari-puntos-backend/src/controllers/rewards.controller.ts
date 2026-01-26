import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { RewardsService } from '../services/rewards.service';
import {
  createRewardSchema,
  updateRewardSchema,
  redeemRewardSchema,
} from '../validators/schemas';
import { sendSuccess, sendCreated, sendPaginated, createPaginationMeta } from '../utils/response';
import { toRewardDTO, toRewardDTOList } from '../utils/mappers';
import { PAGINATION_DEFAULTS } from '../shared/constants';

export class RewardsController {
  private rewardsService = new RewardsService();

  /**
   * POST /rewards
   * Create a custom reward
   */
  createReward = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const data = createRewardSchema.parse(req.body);

      const reward = await this.rewardsService.createReward(userId, data);

      sendCreated(res, toRewardDTO(reward), 'Reward created successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /rewards
   * Get all rewards (paginated)
   */
  getAllRewards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
      const category = req.query.category as string | undefined;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      const result = await this.rewardsService.getAllRewards({
        category,
        isActive,
        page,
        limit,
        userId,
      });

      sendPaginated(
        res,
        toRewardDTOList(result.rewards),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /rewards/available
   * Get rewards available for current user (based on points and level)
   */
  getAvailableRewards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const rewards = await this.rewardsService.getAvailableRewards(userId);

      sendSuccess(res, toRewardDTOList(rewards));
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /rewards/:id
   * Get reward by ID
   */
  getRewardById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const reward = await this.rewardsService.getRewardById(id);

      sendSuccess(res, toRewardDTO(reward));
    } catch (error) {
      throw error;
    }
  };

  /**
   * POST /rewards/redeem
   * Redeem a reward
   */
  redeemReward = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { rewardId } = redeemRewardSchema.parse(req.body);

      await this.rewardsService.redeemReward(userId, rewardId);

      sendSuccess(res, null, 'Reward redeemed successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * PUT /rewards/:id
   * Update a reward
   */
  updateReward = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = updateRewardSchema.parse(req.body);

      const reward = await this.rewardsService.updateReward(id, data);

      sendSuccess(res, toRewardDTO(reward), 'Reward updated successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * DELETE /rewards/:id
   * Delete a reward
   */
  deleteReward = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.rewardsService.deleteReward(id);

      sendSuccess(res, null, 'Reward deleted successfully');
    } catch (error) {
      throw error;
    }
  };
}
