import { EntityManager } from 'typeorm';

import { AppDataSource } from '../config/db';
import { Action, ActionCategory, ActionStatus } from '../entities/Action';
import { LogType } from '../entities/Log';
import { User } from '../entities/User';
import { translate } from '../i18n';
import { AppError, createError } from '../middlewares/errorMiddleware';
import {
  calculateLevel,
  calculatePointsInCurrentLevel,
  getNowUTC6,
} from '../utils/helpers';
import { logger } from '../utils/logger';
import { CreateActionInput, UpdateActionInput } from '../validators/schemas';
import { AchievementsService } from './achievements.service';
import { AuditLogService } from './audit-log.service';
import { PartnerService } from './partner.service';
import { PushNotificationService } from './push-notification.service';
import { StreakService } from './streak.service';

export class ActionsService {
  private actionRepository = AppDataSource.getRepository(Action);
  private userRepository = AppDataSource.getRepository(User);
  private partnerService = new PartnerService();
  private achievementsService = new AchievementsService();
  private auditLog = new AuditLogService();
  private pushNotificationService = new PushNotificationService();
  private streakService = new StreakService();

  async createAction(userId: string, data: CreateActionInput): Promise<Action> {
    logger.info({ message: 'Creating action', userId, actionData: data });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.warn({ message: 'User not found for action creation', userId });
      throw createError.userNotFound();
    }

    const action = this.actionRepository.create({
      userId,
      title: data.title,
      description: data.description,
      category: data.category as ActionCategory,
      metadata: data.metadata as Record<string, unknown>,
      status: ActionStatus.PENDING,
    });

    const savedAction = await this.actionRepository.save(action);
    logger.info({
      message: 'Action created successfully',
      userId,
      actionId: savedAction.id,
    });

    await this.auditLog.record({
      userId,
      type: LogType.ACTION_CREATED,
      message: translate('logs.actionCreated', user.locale, { title: action.title }),
      relatedEntityId: action.id,
      relatedEntityType: 'Action',
    });

    try {
      const partnerIdForNotif = await this.partnerService.getPartnerId(userId);
      if (partnerIdForNotif) {
        const partner = await this.userRepository.findOne({
          where: { id: partnerIdForNotif },
        });
        if (partner?.pushToken) {
          await this.pushNotificationService.sendActionCreatedNotification(
            partner.pushToken,
            user.firstName || user.email,
            action.title,
            partner.locale
          );
        }
      }
    } catch (err) {
      logger.error({ err }, 'Push notification failed after createAction');
    }

    return action;
  }

  async getActionById(actionId: string, requestingUserId?: string): Promise<Action> {
    const action = await this.actionRepository.findOne({
      where: { id: actionId },
      relations: { user: true },
    });

    if (!action) {
      throw createError.actionNotFound();
    }

    if (requestingUserId) {
      if (action.userId !== requestingUserId) {
        const partnerId = await this.partnerService.getPartnerId(requestingUserId);
        if (partnerId !== action.userId) {
          throw new AppError(
            403,
            'No tienes acceso a esta acción',
            'errors.action.noAccess'
          );
        }
      }
    }

    return action;
  }

  async getUserActions(
    userId: string,
    filters?: {
      status?: ActionStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ actions: Action[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.actionRepository
      .createQueryBuilder('action')
      .where('action.userId = :userId', { userId })
      .orderBy('action.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters?.status) {
      queryBuilder.andWhere('action.status = :status', { status: filters.status });
    }

    const [actions, total] = await queryBuilder.getManyAndCount();

    return { actions, total };
  }

  async getPartnerActions(
    userId: string,
    filters?: {
      status?: ActionStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ actions: Action[]; total: number }> {
    const partnerId = await this.partnerService.getPartnerId(userId);

    if (!partnerId) {
      throw createError.partnerNotFound();
    }

    return this.getUserActions(partnerId, filters);
  }

  async updateAction(
    actionId: string,
    userId: string,
    data: UpdateActionInput
  ): Promise<Action> {
    const action = await this.getActionById(actionId);

    if (action.userId !== userId) {
      throw new AppError(
        403,
        'Solo puedes actualizar tus propias acciones',
        'errors.action.onlyOwnUpdate'
      );
    }

    if (action.status !== ActionStatus.PENDING) {
      throw new AppError(
        400,
        'Solo puedes actualizar acciones pendientes',
        'errors.action.onlyPendingUpdate'
      );
    }

    if (data.title !== undefined) action.title = data.title;
    if (data.description !== undefined) action.description = data.description;
    if (data.category !== undefined) action.category = data.category as ActionCategory;
    if (data.metadata !== undefined)
      action.metadata = data.metadata as Record<string, unknown>;

    await this.actionRepository.save(action);

    return action;
  }

  private async resolveApproverAndPartner(
    approverId: string
  ): Promise<{ approver: User; partnerId: string }> {
    const approver = await this.userRepository.findOne({ where: { id: approverId } });
    if (!approver) {
      throw createError.approverNotFound();
    }
    const partnerId = await this.partnerService.getPartnerId(approverId);
    if (!partnerId) {
      throw new AppError(
        403,
        'No tienes una pareja vinculada',
        'errors.partner.notLinked'
      );
    }
    return { approver, partnerId };
  }

  private async lockPendingActionForPartner(
    manager: EntityManager,
    actionId: string,
    partnerId: string,
    ownershipMessage: string,
    ownershipI18nKey: string
  ): Promise<Action> {
    const lockedAction = await manager.getRepository(Action).findOne({
      where: { id: actionId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!lockedAction) {
      throw createError.actionNotFound();
    }

    if (partnerId !== lockedAction.userId) {
      throw new AppError(403, ownershipMessage, ownershipI18nKey);
    }

    if (lockedAction.status !== ActionStatus.PENDING) {
      throw createError.actionNotPending();
    }

    return lockedAction;
  }

  private async runPostApprovalEffects(
    action: Action,
    pointsAwarded: number
  ): Promise<void> {
    try {
      await this.streakService.recordAction(action.userId);
    } catch (err) {
      logger.error({ err }, 'Streak update failed after approveAction');
    }

    try {
      await this.achievementsService.checkAchievementsForUser(action.userId);
    } catch (err) {
      logger.error({ err }, 'Achievement check failed after approveAction');
    }

    try {
      const actionCreator = await this.userRepository.findOne({
        where: { id: action.userId },
      });
      if (actionCreator?.pushToken) {
        await this.pushNotificationService.sendActionApprovedNotification(
          actionCreator.pushToken,
          action.title,
          pointsAwarded,
          actionCreator.locale
        );
      }
    } catch (err) {
      logger.error({ err }, 'Push notification failed after approveAction');
    }
  }

  async approveAction(
    actionId: string,
    approverId: string,
    pointsAwarded: number
  ): Promise<Action> {
    const { approver, partnerId } = await this.resolveApproverAndPartner(approverId);

    const action = await AppDataSource.transaction(async (manager) => {
      const actionRepo = manager.getRepository(Action);
      const userRepo = manager.getRepository(User);

      const lockedAction = await this.lockPendingActionForPartner(
        manager,
        actionId,
        partnerId,
        'Solo puedes aprobar las acciones de tu pareja',
        'errors.action.onlyPartnerApprove'
      );

      lockedAction.status = ActionStatus.APPROVED;
      lockedAction.pointsAwarded = pointsAwarded;
      lockedAction.approvedBy = approverId;
      lockedAction.approvedAt = getNowUTC6();

      await actionRepo.save(lockedAction);

      const actionUser = await userRepo.findOne({
        where: { id: lockedAction.userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!actionUser) throw createError.userNotFound();

      actionUser.totalPoints += pointsAwarded;
      actionUser.currentLevel = calculateLevel(actionUser.totalPoints);
      actionUser.pointsInCurrentLevel = calculatePointsInCurrentLevel(
        actionUser.totalPoints
      );
      await userRepo.save(actionUser);

      await this.auditLog.recordMany(
        [
          {
            userId: lockedAction.userId,
            type: LogType.POINTS_EARNED,
            message: translate('logs.pointsEarned', actionUser.locale, {
              title: lockedAction.title,
            }),
            pointsChange: pointsAwarded,
            relatedEntityId: lockedAction.id,
            relatedEntityType: 'Action',
          },
          {
            userId: lockedAction.userId,
            type: LogType.ACTION_APPROVED,
            message: translate('logs.actionApproved', actionUser.locale, {
              title: lockedAction.title,
            }),
            relatedEntityId: lockedAction.id,
            relatedEntityType: 'Action',
          },
          {
            userId: approverId,
            type: LogType.ACTION_APPROVED,
            message: translate('logs.actionApprovedByYou', approver.locale, {
              title: lockedAction.title,
            }),
            relatedEntityId: lockedAction.id,
            relatedEntityType: 'Action',
          },
        ],
        manager
      );

      return lockedAction;
    });

    await this.runPostApprovalEffects(action, pointsAwarded);

    return action;
  }

  async rejectAction(
    actionId: string,
    approverId: string,
    rejectionReason?: string
  ): Promise<Action> {
    const { approver, partnerId } = await this.resolveApproverAndPartner(approverId);

    const action = await AppDataSource.transaction(async (manager) => {
      const actionRepo = manager.getRepository(Action);
      const userRepo = manager.getRepository(User);

      const lockedAction = await this.lockPendingActionForPartner(
        manager,
        actionId,
        partnerId,
        'Solo puedes rechazar las acciones de tu pareja',
        'errors.action.onlyPartnerReject'
      );

      lockedAction.status = ActionStatus.REJECTED;
      lockedAction.rejectionReason = rejectionReason || null;
      lockedAction.approvedBy = approverId;
      lockedAction.approvedAt = getNowUTC6();

      await actionRepo.save(lockedAction);

      const actionOwner = await userRepo.findOne({
        where: { id: lockedAction.userId },
        select: { id: true, locale: true },
      });

      await this.auditLog.recordMany(
        [
          {
            userId: lockedAction.userId,
            type: LogType.ACTION_REJECTED,
            message: translate('logs.actionRejected', actionOwner?.locale, {
              title: lockedAction.title,
            }),
            relatedEntityId: lockedAction.id,
            relatedEntityType: 'Action',
          },
          {
            userId: approverId,
            type: LogType.ACTION_REJECTED,
            message: translate('logs.actionRejectedByYou', approver.locale, {
              title: lockedAction.title,
            }),
            relatedEntityId: lockedAction.id,
            relatedEntityType: 'Action',
          },
        ],
        manager
      );

      return lockedAction;
    });

    try {
      const actionCreator = await this.userRepository.findOne({
        where: { id: action.userId },
      });
      if (actionCreator?.pushToken) {
        await this.pushNotificationService.sendActionRejectedNotification(
          actionCreator.pushToken,
          action.title,
          actionCreator.locale
        );
      }
    } catch (err) {
      logger.error({ err }, 'Push notification failed after rejectAction');
    }

    return action;
  }

  async deleteAction(actionId: string, userId: string): Promise<void> {
    const action = await this.getActionById(actionId);

    if (action.userId !== userId) {
      throw new AppError(
        403,
        'Solo puedes eliminar tus propias acciones',
        'errors.action.onlyOwnDelete'
      );
    }

    if (action.status !== ActionStatus.PENDING) {
      throw new AppError(
        400,
        'Solo puedes eliminar acciones pendientes',
        'errors.action.onlyPendingDelete'
      );
    }

    await this.actionRepository.remove(action);
  }
}
