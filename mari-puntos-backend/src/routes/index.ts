import { Router } from 'express';

import { AppDataSource } from '../config/db';
import { getNowUTC6 } from '../utils/helpers';
import actionsRoutes from './actions.routes';
import partnerRoutes from './partner.routes';
import permissionTemplatesRoutes from './permission-templates.routes';
import permissionsRoutes from './permissions.routes';
import pointsRoutes from './points.routes';
import streakRoutes from './streak.routes';
import usersRoutes from './users.routes';

const router: Router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MariPuntos API is running',
    timestamp: getNowUTC6().toISOString(),
  });
});

router.get('/ready', async (_req, res) => {
  try {
    await AppDataSource.query('SELECT 1');
    res.json({
      success: true,
      message: 'API is ready',
      timestamp: getNowUTC6().toISOString(),
    });
  } catch {
    res.status(503).json({ success: false, message: 'Database not ready' });
  }
});

router.use('/users', usersRoutes);
router.use('/partner', partnerRoutes);
router.use('/actions', actionsRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/permission-templates', permissionTemplatesRoutes);
router.use('/points', pointsRoutes);
router.use('/streak', streakRoutes);

export default router;
