import { Router } from 'express';

import { PermissionTemplatesController } from '../controllers/permission-templates.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const controller = new PermissionTemplatesController();

router.use(authMiddleware);

router.get('/system', asyncHandler(controller.getSystemTemplates));

router.get('/:id', asyncHandler(controller.getTemplateById));

router.get('/', asyncHandler(controller.getTemplates));

router.post('/', asyncHandler(controller.createTemplate));

router.patch('/:id', asyncHandler(controller.updateTemplate));

router.delete('/:id', asyncHandler(controller.deleteTemplate));

export default router;
