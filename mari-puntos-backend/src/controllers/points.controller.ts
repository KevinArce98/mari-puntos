import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PointsService } from '../services/points.service';
import { sendSuccess, sendPaginated, createPaginationMeta } from '../utils/response';
import { toPointsLogDTOList, toLeaderboardEntryDTO } from '../utils/mappers';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { logger } from '../utils/logger';

export class PointsController {
  private pointsService = new PointsService();

  /**
   * GET /points/history
   * Get current user's points history
   */
  getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );

      logger.debug({ message: 'Getting points history', userId, page, limit });

      const result = await this.pointsService.getPointsHistory(userId, {
        page,
        limit,
      });

      logger.debug({ message: 'Points history retrieved', userId, total: result.total });

      sendPaginated(
        res,
        toPointsLogDTOList(result.logs),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting points history');
      throw error;
    }
  };

  /**
   * GET /points/leaderboard
   * Get points leaderboard
   */
  getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const limit = Math.min(
        parseInt(req.query.limit as string) || 10,
        50
      );

      logger.debug({ message: 'Getting points leaderboard', limit });

      const users = await this.pointsService.getLeaderboard(limit);

      logger.debug({ message: 'Points leaderboard retrieved', count: users.length });

      sendSuccess(res, users.map(toLeaderboardEntryDTO));
    } catch (error) {
      logger.error({ err: error }, 'Error getting points leaderboard');
      throw error;
    }
  };
}
