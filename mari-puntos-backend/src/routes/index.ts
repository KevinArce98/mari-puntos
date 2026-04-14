import { Router } from 'express';
import usersRoutes from './users.routes';
import partnerRoutes from './partner.routes';
import actionsRoutes from './actions.routes';
import permissionsRoutes from './permissions.routes';
import permissionTemplatesRoutes from './permission-templates.routes';
import rewardsRoutes from './rewards.routes';
import pointsRoutes from './points.routes';
import { getNowUTC6 } from '../utils/helpers';
import { AppDataSource } from '../config/db';

const router: Router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: API Health Check
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: MariPuntos API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 */
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
    res.json({ success: true, message: 'API is ready', timestamp: getNowUTC6().toISOString() });
  } catch {
    res.status(503).json({ success: false, message: 'Database not ready' });
  }
});

// API routes
router.use('/users', usersRoutes);
router.use('/partner', partnerRoutes);
router.use('/actions', actionsRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/permission-templates', permissionTemplatesRoutes);
router.use('/rewards', rewardsRoutes);
router.use('/points', pointsRoutes);

export default router;
