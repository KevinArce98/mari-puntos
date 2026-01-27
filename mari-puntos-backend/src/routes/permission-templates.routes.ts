import { Router } from 'express';
import { PermissionTemplatesController } from '../controllers/permission-templates.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const router: Router = Router();
const controller = new PermissionTemplatesController();

// All routes require authentication
router.use(authMiddleware);

// GET /permission-templates/system - Get system templates
router.get('/system', asyncHandler(controller.getSystemTemplates));

// GET /permission-templates/:id - Get template by ID
router.get('/:id', asyncHandler(controller.getTemplateById));

// GET /permission-templates - Get all templates
router.get('/', asyncHandler(controller.getTemplates));

// POST /permission-templates - Create custom template
router.post('/', asyncHandler(controller.createTemplate));

// PATCH /permission-templates/:id - Update custom template
router.patch('/:id', asyncHandler(controller.updateTemplate));

// DELETE /permission-templates/:id - Delete custom template
router.delete('/:id', asyncHandler(controller.deleteTemplate));

export default router;
