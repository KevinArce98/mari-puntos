import { Response } from 'express';

import { AuthRequest } from '../middlewares/authMiddleware';
import { PermissionTemplatesService } from '../services/permission-templates.service';
import { logger } from '../utils/logger';
import { toPermissionTemplateDTO, toPermissionTemplateDTOList } from '../utils/mappers';
import {
  createPaginationMeta,
  sendCreated,
  sendPaginated,
  sendSuccess,
} from '../utils/response';
import {
  createPermissionTemplateSchema,
  permissionTemplatesQuerySchema,
  updatePermissionTemplateSchema,
} from '../validators/schemas';

export class PermissionTemplatesController {
  private templatesService = new PermissionTemplatesService();

  getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { page, limit, category, isSystemTemplate } =
      permissionTemplatesQuerySchema.parse(req.query);

    logger.debug({
      message: 'Getting permission templates',
      userId,
      page,
      limit,
      category,
      isSystemTemplate,
    });

    const result = await this.templatesService.getTemplates(userId, {
      category,
      isSystemTemplate,
      page,
      limit,
    });

    logger.debug({
      message: 'Permission templates retrieved',
      userId,
      total: result.total,
    });

    sendPaginated(
      res,
      toPermissionTemplateDTOList(result.templates),
      createPaginationMeta(page, limit, result.total)
    );
  };

  getSystemTemplates = async (_req: AuthRequest, res: Response): Promise<void> => {
    logger.debug({ message: 'Getting system permission templates' });

    const templates = await this.templatesService.getSystemTemplates();

    logger.debug({
      message: 'System permission templates retrieved',
      count: templates.length,
    });

    sendSuccess(res, toPermissionTemplateDTOList(templates));
  };

  getTemplateById = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;

    logger.debug({
      message: 'Getting permission template by ID',
      userId,
      templateId: id,
    });

    const template = await this.templatesService.getTemplateById(id, userId);

    logger.debug({
      message: 'Permission template retrieved by ID',
      userId,
      templateId: id,
    });

    sendSuccess(res, toPermissionTemplateDTO(template));
  };

  createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const data = createPermissionTemplateSchema.parse(req.body);

    logger.info({
      message: 'Creating permission template',
      userId,
      templateData: data,
    });

    const template = await this.templatesService.createTemplate(userId, data);

    logger.info({
      message: 'Permission template created successfully',
      userId,
      templateId: template.id,
    });

    sendCreated(
      res,
      toPermissionTemplateDTO(template),
      'Permission template created successfully'
    );
  };

  updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;
    const data = updatePermissionTemplateSchema.parse(req.body);

    logger.info({
      message: 'Updating permission template',
      userId,
      templateId: id,
      updateData: data,
    });

    const template = await this.templatesService.updateTemplate(id, userId, data);

    logger.info({
      message: 'Permission template updated successfully',
      userId,
      templateId: id,
    });

    sendSuccess(
      res,
      toPermissionTemplateDTO(template),
      'Permission template updated successfully'
    );
  };

  deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;

    logger.info({ message: 'Deleting permission template', userId, templateId: id });

    await this.templatesService.deleteTemplate(id, userId);

    logger.info({
      message: 'Permission template deleted successfully',
      userId,
      templateId: id,
    });

    sendSuccess(res, { success: true }, 'Permission template deleted successfully');
  };
}
