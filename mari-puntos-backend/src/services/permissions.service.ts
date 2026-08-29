import { AppDataSource } from '../config/db';
import { LogType } from '../entities/Log';
import { Permission, PermissionStatus } from '../entities/Permission';
import { PermissionTemplate } from '../entities/PermissionTemplate';
import { User } from '../entities/User';
import { translate } from '../i18n';
import { AppError, createError } from '../middlewares/errorMiddleware';
import {
  calculateLevel,
  calculatePointsInCurrentLevel,
  getNowUTC6,
} from '../utils/helpers';
import { logger } from '../utils/logger';
import { AchievementsService } from './achievements.service';
import { AuditLogService } from './audit-log.service';
import { PartnerService } from './partner.service';
import { PushNotificationService } from './push-notification.service';

interface UpdatePermissionData {
  requestedDate?: Date;
  durationHours?: number;
  metadata?: Record<string, unknown>;
}

interface CreatePermissionData {
  templateId: string;
  requestedDate: Date;
  durationHours: number;
  metadata?: Record<string, unknown>;
}

export class PermissionsService {
  private permissionRepository = AppDataSource.getRepository(Permission);
  private templateRepository = AppDataSource.getRepository(PermissionTemplate);
  private userRepository = AppDataSource.getRepository(User);
  private partnerService = new PartnerService();
  private achievementsService = new AchievementsService();
  private auditLog = new AuditLogService();
  private pushNotificationService = new PushNotificationService();

  async createPermission(
    userId: string,
    data: CreatePermissionData
  ): Promise<Permission> {
    logger.info({ message: 'Creating permission', userId, permissionData: data });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.warn({ message: 'User not found for permission creation', userId });
      throw createError.userNotFound();
    }

    const partnerId = await this.partnerService.getPartnerId(userId);
    if (!partnerId) {
      logger.warn({ message: 'User has no partner for permission creation', userId });
      throw new AppError(
        400,
        'Debes tener una pareja para solicitar permisos',
        'errors.permission.partnerRequired'
      );
    }

    const template = await this.templateRepository.findOne({
      where: { id: data.templateId },
      relations: { partnerLink: true },
    });

    if (!template || !template.isActive) {
      logger.warn({
        message: 'Permission template not found or inactive',
        userId,
        templateId: data.templateId,
      });
      throw new AppError(
        404,
        'Plantilla de permiso no encontrada',
        'errors.permissionTemplate.notFound'
      );
    }

    if (!template.isSystemTemplate && template.partnerLinkId) {
      const partnerLink = await this.partnerService.getPartnerLink(userId);
      if (!partnerLink || partnerLink.id !== template.partnerLinkId) {
        logger.warn({
          message: 'User does not have access to template',
          userId,
          templateId: data.templateId,
        });
        throw new AppError(
          403,
          'No tienes acceso a esta plantilla',
          'errors.permissionTemplate.noAccess'
        );
      }
    }

    const permission = this.permissionRepository.create({
      templateId: data.templateId,
      requesterId: userId,
      requestedDate: data.requestedDate,
      durationHours: data.durationHours,
      pointsCost: 0,
      metadata: data.metadata,
      status: PermissionStatus.PENDING,
    });

    const savedPermission = await this.permissionRepository.save(permission);
    logger.info({
      message: 'Permission created successfully',
      userId,
      permissionId: savedPermission.id,
    });

    await this.auditLog.record({
      userId,
      type: LogType.PERMISSION_REQUESTED,
      message: translate('logs.permissionRequested', user.locale, {
        title: template.title,
      }),
      relatedEntityId: permission.id,
      relatedEntityType: 'Permission',
    });

    const partner = await this.userRepository.findOne({ where: { id: partnerId } });
    if (partner?.pushToken) {
      await this.pushNotificationService.sendPermissionRequestedNotification(
        partner.pushToken,
        user.firstName || user.email,
        template.title,
        partner.locale
      );
    }

    return permission;
  }

  async getPermissionById(permissionId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
      relations: { requester: true, approver: true, template: true },
    });

    if (!permission) {
      throw new AppError(404, 'Permiso no encontrado', 'errors.permission.notFound');
    }

    return permission;
  }

  async getUserPermissions(
    userId: string,
    filters?: {
      status?: PermissionStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ permissions: Permission[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.requester', 'requester')
      .leftJoinAndSelect('permission.approver', 'approver')
      .leftJoinAndSelect('permission.template', 'template')
      .where('permission.requesterId = :userId', { userId })
      .orderBy('permission.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters?.status) {
      queryBuilder.andWhere('permission.status = :status', { status: filters.status });
    }

    const [permissions, total] = await queryBuilder.getManyAndCount();

    return { permissions, total };
  }

  async getPartnerPermissions(
    userId: string,
    filters?: {
      status?: PermissionStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ permissions: Permission[]; total: number }> {
    const partnerId = await this.partnerService.getPartnerId(userId);

    if (!partnerId) {
      throw createError.partnerNotFound();
    }

    return this.getUserPermissions(partnerId, filters);
  }

  async respondToPermission(
    permissionId: string,
    approverId: string,
    approved: boolean,
    responseMessage?: string,
    pointsCost?: number
  ): Promise<Permission> {
    const permission = await this.getPermissionById(permissionId);
    const approver = await this.userRepository.findOne({ where: { id: approverId } });

    if (!approver) {
      throw createError.approverNotFound();
    }

    const partnerId = await this.partnerService.getPartnerId(approverId);
    if (partnerId !== permission.requesterId) {
      throw new AppError(
        403,
        'Solo puedes responder a los permisos de tu pareja',
        'errors.permission.onlyPartnerRespond'
      );
    }

    if (permission.status !== PermissionStatus.PENDING) {
      throw new AppError(
        400,
        'El permiso no está pendiente',
        'errors.permission.notPending'
      );
    }

    if (approved) {
      if (!pointsCost || pointsCost < 0) {
        throw new AppError(
          400,
          'El costo en puntos es requerido al aprobar',
          'errors.permission.pointsCostRequired'
        );
      }
      permission.pointsCost = pointsCost;
    }

    const templateTitle = permission.template.title;

    const requesterForLocale = await this.userRepository.findOne({
      where: { id: permission.requesterId },
      select: { id: true, locale: true },
    });
    const requesterLocale = requesterForLocale?.locale;

    permission.status = approved ? PermissionStatus.APPROVED : PermissionStatus.REJECTED;
    permission.approverId = approverId;
    permission.respondedAt = getNowUTC6();
    permission.responseMessage = responseMessage || null;

    const logType = approved ? LogType.PERMISSION_APPROVED : LogType.PERMISSION_REJECTED;

    await AppDataSource.transaction(async (manager) => {
      const permissionRepo = manager.getRepository(Permission);
      const userRepo = manager.getRepository(User);

      await permissionRepo.save(permission);

      if (approved && permission.pointsCost > 0) {
        const requesterUser = await userRepo.findOne({
          where: { id: permission.requesterId },
        });
        if (!requesterUser)
          throw new AppError(
            404,
            'Solicitante no encontrado',
            'errors.permission.requesterNotFound'
          );
        if (requesterUser.totalPoints < permission.pointsCost) {
          throw new AppError(
            400,
            `Puntos insuficientes (tiene ${requesterUser.totalPoints}, necesita ${permission.pointsCost}).`,
            'errors.points.insufficientDetailed',
            { have: requesterUser.totalPoints, need: permission.pointsCost }
          );
        }
        requesterUser.totalPoints -= permission.pointsCost;
        requesterUser.currentLevel = calculateLevel(requesterUser.totalPoints);
        requesterUser.pointsInCurrentLevel = calculatePointsInCurrentLevel(
          requesterUser.totalPoints
        );
        await userRepo.save(requesterUser);

        await this.auditLog.record(
          {
            userId: permission.requesterId,
            type: LogType.POINTS_SPENT,
            message: translate('logs.pointsSpent', requesterLocale, {
              title: templateTitle,
            }),
            pointsChange: -permission.pointsCost,
            relatedEntityId: permission.id,
            relatedEntityType: 'Permission',
          },
          manager
        );
      }

      await this.auditLog.recordMany(
        [
          {
            userId: permission.requesterId,
            type: logType,
            message: translate(
              approved ? 'logs.permissionApproved' : 'logs.permissionRejected',
              requesterLocale,
              { title: templateTitle }
            ),
            pointsChange: 0,
            relatedEntityId: permission.id,
            relatedEntityType: 'Permission',
          },
          {
            userId: approverId,
            type: logType,
            message: translate(
              approved ? 'logs.permissionApprovedByYou' : 'logs.permissionRejectedByYou',
              approver.locale,
              { title: templateTitle }
            ),
            relatedEntityId: permission.id,
            relatedEntityType: 'Permission',
          },
        ],
        manager
      );
    });

    try {
      const requester = await this.userRepository.findOne({
        where: { id: permission.requesterId },
      });
      if (requester?.pushToken) {
        await this.pushNotificationService.sendPermissionResponseNotification(
          requester.pushToken,
          approved,
          templateTitle,
          requester.locale
        );
      }
    } catch (err) {
      logger.error({ err }, 'Push notification failed after respondToPermission');
    }

    if (approved && permission.requesterId) {
      try {
        await this.achievementsService.checkAchievementsForUser(permission.requesterId);
      } catch (err) {
        logger.error({ err }, 'Achievement check failed after respondToPermission');
      }
    }

    return permission;
  }

  async updatePermission(
    permissionId: string,
    userId: string,
    data: UpdatePermissionData
  ): Promise<Permission> {
    const permission = await this.getPermissionById(permissionId);

    if (permission.requesterId !== userId) {
      throw new AppError(
        403,
        'Solo puedes actualizar tus propios permisos',
        'errors.permission.onlyOwnUpdate'
      );
    }

    if (permission.status !== PermissionStatus.PENDING) {
      throw new AppError(
        400,
        'Solo puedes actualizar permisos pendientes',
        'errors.permission.onlyPendingUpdate'
      );
    }

    if (data.requestedDate !== undefined) permission.requestedDate = data.requestedDate;
    if (data.durationHours !== undefined) permission.durationHours = data.durationHours;
    if (data.metadata !== undefined)
      permission.metadata = data.metadata as Record<string, unknown>;

    await this.permissionRepository.save(permission);

    return permission;
  }

  async deletePermission(permissionId: string, userId: string): Promise<void> {
    const permission = await this.getPermissionById(permissionId);

    if (permission.requesterId !== userId) {
      throw new AppError(
        403,
        'Solo puedes eliminar tus propios permisos',
        'errors.permission.onlyOwnDelete'
      );
    }

    if (permission.status !== PermissionStatus.PENDING) {
      throw new AppError(
        400,
        'Solo puedes eliminar permisos pendientes',
        'errors.permission.onlyPendingDelete'
      );
    }

    await this.permissionRepository.remove(permission);
  }
}
