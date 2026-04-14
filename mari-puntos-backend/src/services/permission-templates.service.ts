import { Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { PermissionTemplate } from '../entities/PermissionTemplate';
import { PartnerLink } from '../entities/PartnerLink';
import { AppError } from '../middlewares/errorMiddleware';
import { PermissionCategory } from '../entities/PermissionTemplate';
import { logger } from '../utils/logger';

interface CreatePermissionTemplateData {
  title: string;
  description?: string;
  category: PermissionCategory;
  suggestedDurationHours?: number;
  suggestedPointsCost?: number;
  metadata?: Record<string, unknown>;
}

interface GetTemplatesParams {
  category?: PermissionCategory;
  isSystemTemplate?: boolean;
  page?: number;
  limit?: number;
}

export class PermissionTemplatesService {
  private templateRepository: Repository<PermissionTemplate>;
  private partnerLinkRepository: Repository<PartnerLink>;

  constructor() {
    this.templateRepository = AppDataSource.getRepository(PermissionTemplate);
    this.partnerLinkRepository = AppDataSource.getRepository(PartnerLink);
  }

  /**
   * Get all permission templates (system + custom for user's partnership)
   */
  async getTemplates(userId: string, params: GetTemplatesParams = {}) {
    logger.debug({ message: 'Getting permission templates', userId, params });
    const { category, isSystemTemplate, page = 1, limit = 50 } = params;

    // Get user's partner link
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.isActive = :isActive', { isActive: true });

    // Filter by category if provided
    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    // Filter by system/custom if specified
    if (isSystemTemplate !== undefined) {
      query.andWhere('template.isSystemTemplate = :isSystemTemplate', {
        isSystemTemplate,
      });
    } else {
      // Show system templates + custom templates for this partnership
      query.andWhere(
        '(template.isSystemTemplate = true OR template.partnerLinkId = :partnerLinkId)',
        { partnerLinkId: partnerLink?.id || null }
      );
    }

    query
      .orderBy('template.isSystemTemplate', 'DESC')
      .addOrderBy('template.category', 'ASC')
      .addOrderBy('template.title', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [templates, total] = await query.getManyAndCount();
    logger.info({ message: 'Permission templates retrieved', userId, total, params });

    return { templates, total };
  }

  /**
   * Get system permission templates only
   */
  async getSystemTemplates() {
    logger.debug({ message: 'Getting system permission templates' });
    const templates = await this.templateRepository.find({
      where: { isSystemTemplate: true, isActive: true },
      order: {
        category: 'ASC',
        title: 'ASC',
      },
    });
    logger.info({ message: 'System permission templates retrieved', count: templates.length });
    return templates;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string, userId: string) {
    logger.debug({ message: 'Getting template by ID', templateId, userId });
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
      relations: ['partnerLink'],
    });

    if (!template) {
      logger.warn({ message: 'Template not found', templateId });
      throw new AppError(404, 'Plantilla de permiso no encontrada');
    }

    // Check access: system templates are public, custom templates only for the partnership
    if (!template.isSystemTemplate && template.partnerLinkId) {
      const partnerLink = await this.partnerLinkRepository.findOne({
        where: [
          { id: template.partnerLinkId, user1Id: userId },
          { id: template.partnerLinkId, user2Id: userId },
        ],
      });

      if (!partnerLink) {
        logger.warn({ message: 'Access denied to template', templateId, userId });
        throw new AppError(403, 'No tienes acceso a esta plantilla');
      }
    }

    logger.info({ message: 'Template retrieved', templateId, userId });
    return template;
  }

  /**
   * Create custom permission template for partnership
   */
  async createTemplate(userId: string, data: CreatePermissionTemplateData) {
    logger.info({ message: 'Creating permission template', userId, templateData: data });
    // Get user's partner link
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (!partnerLink) {
      logger.warn({ message: 'No partner link found for template creation', userId });
      throw new AppError(
        400,
        'Debes estar vinculado a una pareja para crear plantillas personalizadas'
      );
    }

    const template = this.templateRepository.create({
      ...data,
      partnerLinkId: partnerLink.id,
      isSystemTemplate: false,
      isActive: true,
    });

    const savedTemplate = await this.templateRepository.save(template);
    logger.info({ message: 'Permission template created', userId, templateId: savedTemplate.id });
    return savedTemplate;
  }

  /**
   * Update custom permission template
   */
  async updateTemplate(
    templateId: string,
    userId: string,
    data: Partial<CreatePermissionTemplateData>
  ) {
    logger.info({ message: 'Updating permission template', templateId, userId, updateData: data });
    const template = await this.getTemplateById(templateId, userId);

    // Can't edit system templates
    if (template.isSystemTemplate) {
      logger.warn({ message: 'Attempt to edit system template', templateId, userId });
      throw new AppError(403, 'No se pueden editar plantillas del sistema');
    }

    // Verify ownership
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [
        { id: template.partnerLinkId!, user1Id: userId },
        { id: template.partnerLinkId!, user2Id: userId },
      ],
    });

    if (!partnerLink) {
      logger.warn({ message: 'No permission to edit template', templateId, userId });
      throw new AppError(403, 'No tienes permisos para editar esta plantilla');
    }

    // Update template
    Object.assign(template, data);
    const updatedTemplate = await this.templateRepository.save(template);
    logger.info({ message: 'Permission template updated', templateId, userId });
    return updatedTemplate;
  }

  /**
   * Delete (deactivate) custom permission template
   */
  async deleteTemplate(templateId: string, userId: string) {
    logger.info({ message: 'Deleting permission template', templateId, userId });
    const template = await this.getTemplateById(templateId, userId);

    // Can't delete system templates
    if (template.isSystemTemplate) {
      logger.warn({ message: 'Attempt to delete system template', templateId, userId });
      throw new AppError(403, 'No se pueden eliminar plantillas del sistema');
    }

    // Verify ownership
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [
        { id: template.partnerLinkId!, user1Id: userId },
        { id: template.partnerLinkId!, user2Id: userId },
      ],
    });

    if (!partnerLink) {
      logger.warn({ message: 'No permission to delete template', templateId, userId });
      throw new AppError(403, 'No tienes permisos para eliminar esta plantilla');
    }

    // Soft delete by deactivating
    template.isActive = false;
    await this.templateRepository.save(template);
    logger.info({ message: 'Permission template deleted', templateId, userId });
  }
}
