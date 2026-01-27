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
import { z } from 'zod';
import { PermissionCategory } from '../entities/PermissionTemplate';

const createTemplateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.nativeEnum(PermissionCategory),
  suggestedDurationHours: z.number().int().positive().optional(),
  suggestedPointsCost: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

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

      const result = await this.templatesService.getTemplates(userId, {
        category,
        isSystemTemplate,
        page,
        limit,
      });

      sendPaginated(
        res,
        toPermissionTemplateDTOList(result.templates),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /permission-templates/system
   * Get system templates only
   */
  getSystemTemplates = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const templates = await this.templatesService.getSystemTemplates();
      sendSuccess(res, toPermissionTemplateDTOList(templates));
    } catch (error) {
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
      const { id } = req.params;

      const template = await this.templatesService.getTemplateById(id, userId);
      sendSuccess(res, toPermissionTemplateDTO(template));
    } catch (error) {
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
      const data = createTemplateSchema.parse(req.body);

      const template = await this.templatesService.createTemplate(userId, data);
      sendCreated(res, toPermissionTemplateDTO(template), 'Permission template created successfully');
    } catch (error) {
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
      const { id } = req.params;
      const data = updateTemplateSchema.parse(req.body);

      const template = await this.templatesService.updateTemplate(id, userId, data);
      sendSuccess(res, toPermissionTemplateDTO(template), 'Permission template updated successfully');
    } catch (error) {
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
      const { id } = req.params;

      await this.templatesService.deleteTemplate(id, userId);
      sendSuccess(res, { success: true }, 'Permission template deleted successfully');
    } catch (error) {
      throw error;
    }
  };
}
