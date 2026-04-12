import { AppDataSource } from '../config/db';
import { Action, ActionStatus, ActionCategory } from '../entities/Action';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { getNowUTC6, calculateLevel, calculatePointsInCurrentLevel } from '../utils/helpers';
import { PartnerService } from './partner.service';
import { PointsService } from './points.service';
import { CreateActionInput, UpdateActionInput } from '../validators/schemas';
import { PushNotificationService } from './push-notification.service';
import { logger } from '../utils/logger';

export class ActionsService {
  private actionRepository = AppDataSource.getRepository(Action);
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private partnerService = new PartnerService();
  private pointsService = new PointsService();
  private pushNotificationService = new PushNotificationService();

  async createAction(userId: string, data: CreateActionInput): Promise<Action> {
    logger.info({ message: 'Creating action', userId, actionData: data });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.warn({ message: 'User not found for action creation', userId });
      throw new AppError(404, 'Usuario no encontrado');
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
    logger.info({ message: 'Action created successfully', userId, actionId: savedAction.id });

    // Create log
    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.ACTION_CREATED,
        message: `Acción creada: ${action.title}`,
        relatedEntityId: action.id,
        relatedEntityType: 'Action',
      })
    );

    // Fire-and-forget notification
    try {
      const partnerIdForNotif = await this.partnerService.getPartnerId(userId);
      if (partnerIdForNotif) {
        const partner = await this.userRepository.findOne({ where: { id: partnerIdForNotif } });
        if (partner?.pushToken) {
          await this.pushNotificationService.sendActionCreatedNotification(
            partner.pushToken,
            user.firstName || user.email,
            action.title
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
      relations: ['user'],
    });

    if (!action) {
      throw new AppError(404, 'Acción no encontrada');
    }

    if (requestingUserId) {
      if (action.userId !== requestingUserId) {
        const partnerId = await this.partnerService.getPartnerId(requestingUserId);
        if (partnerId !== action.userId) {
          throw new AppError(403, 'No tienes acceso a esta acción');
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
      throw new AppError(404, 'Pareja no encontrada');
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
      throw new AppError(403, 'Solo puedes actualizar tus propias acciones');
    }

    if (action.status !== ActionStatus.PENDING) {
      throw new AppError(400, 'Solo puedes actualizar acciones pendientes');
    }

    if (data.title !== undefined) action.title = data.title;
    if (data.description !== undefined) action.description = data.description;
    if (data.category !== undefined) action.category = data.category as ActionCategory;
    if (data.metadata !== undefined) action.metadata = data.metadata as Record<string, unknown>;

    await this.actionRepository.save(action);

    return action;
  }

  async approveAction(
    actionId: string,
    approverId: string,
    pointsAwarded: number
  ): Promise<Action> {
    // Verify approver exists and is the action owner's partner BEFORE entering tx
    const approver = await this.userRepository.findOne({ where: { id: approverId } });
    if (!approver) {
      throw new AppError(404, 'Aprobador no encontrado');
    }
    const partnerId = await this.partnerService.getPartnerId(approverId);
    if (!partnerId) {
      throw new AppError(403, 'No tienes una pareja vinculada');
    }

    // Transaction: lock the action row, re-check status, apply mutation atomically.
    const action = await AppDataSource.transaction(async (manager) => {
      const actionRepo = manager.getRepository(Action);
      const userRepo = manager.getRepository(User);
      const logRepo = manager.getRepository(Log);

      // Lock action row to prevent concurrent approve/reject of same action
      const lockedAction = await actionRepo.findOne({
        where: { id: actionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedAction) {
        throw new AppError(404, 'Acción no encontrada');
      }

      if (partnerId !== lockedAction.userId) {
        throw new AppError(403, 'Solo puedes aprobar las acciones de tu pareja');
      }

      // Re-check status inside the lock (the key race-fix)
      if (lockedAction.status !== ActionStatus.PENDING) {
        throw new AppError(400, 'La acción no está pendiente');
      }

      lockedAction.status = ActionStatus.APPROVED;
      lockedAction.pointsAwarded = pointsAwarded;
      lockedAction.approvedBy = approverId;
      lockedAction.approvedAt = getNowUTC6();

      await actionRepo.save(lockedAction);

      // Lock user for points update to serialize concurrent point mutations
      const actionUser = await userRepo.findOne({
        where: { id: lockedAction.userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!actionUser) throw new AppError(404, 'Usuario no encontrado');

      actionUser.totalPoints += pointsAwarded;
      actionUser.currentLevel = calculateLevel(actionUser.totalPoints);
      actionUser.pointsInCurrentLevel = calculatePointsInCurrentLevel(actionUser.totalPoints);
      await userRepo.save(actionUser);

      await logRepo.save([
        logRepo.create({
          userId: lockedAction.userId,
          type: LogType.POINTS_EARNED,
          message: `Puntos ganados: ${lockedAction.title}`,
          pointsChange: pointsAwarded,
          relatedEntityId: lockedAction.id,
          relatedEntityType: 'Action',
        }),
        logRepo.create({
          userId: lockedAction.userId,
          type: LogType.ACTION_APPROVED,
          message: `Acción aprobada: ${lockedAction.title}`,
          relatedEntityId: lockedAction.id,
          relatedEntityType: 'Action',
        }),
        logRepo.create({
          userId: approverId,
          type: LogType.ACTION_APPROVED,
          message: `Aprobaste acción: ${lockedAction.title}`,
          relatedEntityId: lockedAction.id,
          relatedEntityType: 'Action',
        }),
      ]);

      return lockedAction;
    });

    // Non-critical: check achievements and send notification outside the transaction
    try {
      await this.pointsService.checkAchievementsForUser(action.userId);
    } catch (err) {
      logger.error({ err }, 'Achievement check failed after approveAction');
    }

    try {
      const actionCreator = await this.userRepository.findOne({ where: { id: action.userId } });
      if (actionCreator?.pushToken) {
        await this.pushNotificationService.sendActionApprovedNotification(
          actionCreator.pushToken,
          action.title,
          pointsAwarded
        );
      }
    } catch (err) {
      logger.error({ err }, 'Push notification failed after approveAction');
    }

    return action;
  }

  async rejectAction(
    actionId: string,
    approverId: string,
    rejectionReason?: string
  ): Promise<Action> {
    const approver = await this.userRepository.findOne({ where: { id: approverId } });
    if (!approver) {
      throw new AppError(404, 'Aprobador no encontrado');
    }
    const partnerId = await this.partnerService.getPartnerId(approverId);
    if (!partnerId) {
      throw new AppError(403, 'No tienes una pareja vinculada');
    }

    // Transaction: lock action, re-check status, save status + logs atomically
    const action = await AppDataSource.transaction(async (manager) => {
      const actionRepo = manager.getRepository(Action);
      const logRepo = manager.getRepository(Log);

      const lockedAction = await actionRepo.findOne({
        where: { id: actionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedAction) {
        throw new AppError(404, 'Acción no encontrada');
      }

      if (partnerId !== lockedAction.userId) {
        throw new AppError(403, 'Solo puedes rechazar las acciones de tu pareja');
      }

      if (lockedAction.status !== ActionStatus.PENDING) {
        throw new AppError(400, 'La acción no está pendiente');
      }

      lockedAction.status = ActionStatus.REJECTED;
      lockedAction.rejectionReason = rejectionReason || null;
      lockedAction.approvedBy = approverId;
      lockedAction.approvedAt = getNowUTC6();

      await actionRepo.save(lockedAction);

      await logRepo.save([
        logRepo.create({
          userId: lockedAction.userId,
          type: LogType.ACTION_REJECTED,
          message: `Acción rechazada: ${lockedAction.title}`,
          relatedEntityId: lockedAction.id,
          relatedEntityType: 'Action',
        }),
        logRepo.create({
          userId: approverId,
          type: LogType.ACTION_REJECTED,
          message: `Rechazaste acción: ${lockedAction.title}`,
          relatedEntityId: lockedAction.id,
          relatedEntityType: 'Action',
        }),
      ]);

      return lockedAction;
    });

    // Fire-and-forget notification outside transaction
    try {
      const actionCreator = await this.userRepository.findOne({ where: { id: action.userId } });
      if (actionCreator?.pushToken) {
        await this.pushNotificationService.sendActionRejectedNotification(
          actionCreator.pushToken,
          action.title
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
      throw new AppError(403, 'Solo puedes eliminar tus propias acciones');
    }

    if (action.status !== ActionStatus.PENDING) {
      throw new AppError(400, 'Solo puedes eliminar acciones pendientes');
    }

    await this.actionRepository.remove(action);
  }
}
