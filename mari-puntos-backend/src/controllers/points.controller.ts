import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PointsService } from '../services/points.service';
import { sendSuccess, sendPaginated, createPaginationMeta } from '../utils/response';
import { toPointsLogDTOList, toLeaderboardEntryDTO } from '../utils/mappers';
import { PAGINATION_DEFAULTS } from '../shared/constants';

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

      const result = await this.pointsService.getPointsHistory(userId, {
        page,
        limit,
      });

      sendPaginated(
        res,
        toPointsLogDTOList(result.logs),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
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
      
      const users = await this.pointsService.getLeaderboard(limit);

      sendSuccess(res, users.map(toLeaderboardEntryDTO));
    } catch (error) {
      throw error;
    }
  };
}
