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
import { logger } from '../utils/logger';

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

      logger.info({ message: 'Creating reward', userId, rewardData: data });

      const reward = await this.rewardsService.createReward(userId, data);

      logger.info({ message: 'Reward created successfully', userId, rewardId: reward.id });

      sendCreated(res, toRewardDTO(reward), 'Reward created successfully');
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error creating reward');
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

      logger.debug({ message: 'Getting all rewards', userId, page, limit, category, isActive });

      const result = await this.rewardsService.getAllRewards({
        category,
        isActive,
        page,
        limit,
        userId,
      });

      logger.debug({ message: 'All rewards retrieved', userId, total: result.total });

      sendPaginated(
        res,
        toRewardDTOList(result.rewards),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting all rewards');
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

      logger.debug({ message: 'Available rewards retrieved', userId, count: rewards.length });

      sendSuccess(res, toRewardDTOList(rewards));
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting available rewards');
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

      logger.debug({ message: 'Getting reward by ID', rewardId: id, userId: req.userId });

      const reward = await this.rewardsService.getRewardById(id);

      logger.debug({ message: 'Reward retrieved', rewardId: id });

      sendSuccess(res, toRewardDTO(reward));
    } catch (error) {
      logger.error({ err: error, rewardId: req.params.id, userId: req.userId }, 'Error getting reward by ID');
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

      logger.info({ message: 'Redeeming reward', userId, rewardId });

      await this.rewardsService.redeemReward(userId, rewardId);

      logger.info({ message: 'Reward redeemed successfully', userId, rewardId });

      sendSuccess(res, null, 'Reward redeemed successfully');
    } catch (error) {
      logger.error({ err: error, userId: req.userId, rewardId: req.body?.rewardId }, 'Error redeeming reward');
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

      logger.info({ message: 'Updating reward', rewardId: id, updateData: data });

      const reward = await this.rewardsService.updateReward(id, data);

      logger.info({ message: 'Reward updated successfully', rewardId: id });

      sendSuccess(res, toRewardDTO(reward), 'Reward updated successfully');
    } catch (error) {
      logger.error({ err: error, rewardId: req.params.id }, 'Error updating reward');
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

      logger.info({ message: 'Deleting reward', rewardId: id });

      await this.rewardsService.deleteReward(id);

      logger.info({ message: 'Reward deleted successfully', rewardId: id });

      sendSuccess(res, null, 'Reward deleted successfully');
    } catch (error) {
      logger.error({ err: error, rewardId: req.params.id }, 'Error deleting reward');
      throw error;
    }
  };
}
