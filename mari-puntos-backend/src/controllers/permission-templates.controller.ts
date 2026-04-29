import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PermissionTemplatesService } from '../services/permission-templates.service';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  createPaginationMeta,
} from '../utils/response';
import { toPermissionTemplateDTO, toPermissionTemplateDTOList } from '../utils/mappers';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { PermissionCategory } from '../entities/PermissionTemplate';
import { logger } from '../utils/logger';
import {
  createPermissionTemplateSchema,
  updatePermissionTemplateSchema,
} from '../validators/schemas';

export class PermissionTemplatesController {
  private templatesService = new PermissionTemplatesService();

  /**
   * GET /permission-templates
   * Get all templates (system + custom for user's partnership)
   */
  getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
      const category = req.query.category as PermissionCategory | undefined;
      const isSystemTemplate =
        req.query.isSystemTemplate === 'true'
          ? true
          : req.query.isSystemTemplate === 'false'
            ? false
            : undefined;

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
    } catch (error) {
      logger.error(
        { err: error, userId: req.userId },
        'Error getting permission templates'
      );
      throw error;
    }
  };

  /**
   * GET /permission-templates/system
   * Get system templates only
   */
  getSystemTemplates = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      logger.debug({ message: 'Getting system permission templates' });

      const templates = await this.templatesService.getSystemTemplates();

      logger.debug({
        message: 'System permission templates retrieved',
        count: templates.length,
      });

      sendSuccess(res, toPermissionTemplateDTOList(templates));
    } catch (error) {
      logger.error({ err: error }, 'Error getting system permission templates');
      throw error;
    }
  };

  /**
   * GET /permission-templates/:id
   * Get template by ID
   */
  getTemplateById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      logger.error(
        { err: error, userId: req.userId, templateId: req.params.id },
        'Error getting permission template by ID'
      );
      throw error;
    }
  };

  /**
   * POST /permission-templates
   * Create custom template
   */
  createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      logger.error(
        { err: error, userId: req.userId },
        'Error creating permission template'
      );
      throw error;
    }
  };

  /**
   * PATCH /permission-templates/:id
   * Update custom template
   */
  updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      logger.error(
        { err: error, userId: req.userId, templateId: req.params.id },
        'Error updating permission template'
      );
      throw error;
    }
  };

  /**
   * DELETE /permission-templates/:id
   * Delete (deactivate) custom template
   */
  deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      logger.error(
        { err: error, userId: req.userId, templateId: req.params.id },
        'Error deleting permission template'
      );
      throw error;
    }
  };
}
