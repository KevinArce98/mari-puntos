import { Response } from 'express';

import { AuthRequest } from '../middlewares/authMiddleware';
import { PointsService } from '../services/points.service';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { logger } from '../utils/logger';
import { toLeaderboardEntryDTO, toPointsLogDTOList } from '../utils/mappers';
import { createPaginationMeta, sendPaginated, sendSuccess } from '../utils/response';

export class PointsController {
  private pointsService = new PointsService();

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

  getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      logger.debug({ message: 'Getting points leaderboard', userId, limit });

      const users = await this.pointsService.getLeaderboard(userId, limit);

      logger.debug({ message: 'Points leaderboard retrieved', count: users.length });

      sendSuccess(res, users.map(toLeaderboardEntryDTO));
    } catch (error) {
      logger.error({ err: error }, 'Error getting points leaderboard');
      throw error;
    }
  };
}
