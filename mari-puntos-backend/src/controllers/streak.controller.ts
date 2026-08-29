import { Response } from 'express';

import { AuthRequest } from '../middlewares/authMiddleware';
import { StreakService } from '../services/streak.service';
import { sendSuccess } from '../utils/response';

const streakService = new StreakService();

export const getStreak = async (req: AuthRequest, res: Response) => {
  const streak = await streakService.getStreak(req.userId!);
  sendSuccess(res, streak);
};
