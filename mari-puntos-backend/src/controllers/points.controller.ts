import { Response } from 'express';

import { AuthRequest } from '../middlewares/authMiddleware';
import { PointsService } from '../services/points.service';
import { logger } from '../utils/logger';
import { toLeaderboardEntryDTO, toPointsLogDTOList } from '../utils/mappers';
import { createPaginationMeta, sendPaginated, sendSuccess } from '../utils/response';
import { leaderboardQuerySchema, paginationSchema } from '../validators/schemas';

export class PointsController {
  private pointsService = new PointsService();

  getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { page, limit } = paginationSchema.parse(req.query);

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
  };

  getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { limit } = leaderboardQuerySchema.parse(req.query);

    logger.debug({ message: 'Getting points leaderboard', userId, limit });

    const users = await this.pointsService.getLeaderboard(userId, limit);

    logger.debug({ message: 'Points leaderboard retrieved', count: users.length });

    sendSuccess(res, users.map(toLeaderboardEntryDTO));
  };
}
