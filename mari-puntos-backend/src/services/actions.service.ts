import { AppDataSource } from '../config/db';
import { Action, ActionStatus, ActionCategory } from '../entities/Action';
import { User, UserRole } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { PartnerService } from './partner.service';
import { PointsService } from './points.service';
import { CreateActionInput, UpdateActionInput } from '../validators/schemas';

export class ActionsService {
  private actionRepository = AppDataSource.getRepository(Action);
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private partnerService = new PartnerService();
  private pointsService = new PointsService();

  async createAction(userId: string, data: CreateActionInput): Promise<Action> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    if (user.role !== UserRole.HUSBAND) {
      throw new AppError(403, 'Solo los esposos pueden crear acciones');
    }

    const action = this.actionRepository.create({
      userId,
      title: data.title,
      description: data.description,
      category: data.category as ActionCategory,
      metadata: data.metadata as Record<string, any>,
      status: ActionStatus.PENDING,
    });

    await this.actionRepository.save(action);

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

    return action;
  }

  async getActionById(actionId: string): Promise<Action> {
    const action = await this.actionRepository.findOne({
      where: { id: actionId },
      relations: ['user'],
    });

    if (!action) {
      throw new AppError(404, 'Acción no encontrada');
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
    if (data.metadata !== undefined) action.metadata = data.metadata as Record<string, any>;

    await this.actionRepository.save(action);

    return action;
  }

  async approveAction(
    actionId: string,
    approverId: string,
    pointsAwarded: number
  ): Promise<Action> {
    const action = await this.getActionById(actionId);
    const approver = await this.userRepository.findOne({ where: { id: approverId } });

    if (!approver) {
      throw new AppError(404, 'Aprobador no encontrado');
    }

    if (approver.role !== UserRole.WIFE) {
      throw new AppError(403, 'Solo las esposas pueden aprobar acciones');
    }

    // Verify approver is partner
    const partnerId = await this.partnerService.getPartnerId(approverId);
    if (partnerId !== action.userId) {
      throw new AppError(403, 'Solo puedes aprobar las acciones de tu pareja');
    }

    if (action.status !== ActionStatus.PENDING) {
      throw new AppError(400, 'La acción no está pendiente');
    }

    action.status = ActionStatus.APPROVED;
    action.pointsAwarded = pointsAwarded;
    action.approvedBy = approverId;
    action.approvedAt = new Date();

    await this.actionRepository.save(action);

    // Add points to user
    await this.pointsService.addPoints(
      action.userId,
      pointsAwarded,
      `Acción aprobada: ${action.title}`
    );

    // Create logs
    await this.logRepository.save([
      this.logRepository.create({
        userId: action.userId,
        type: LogType.ACTION_APPROVED,
        message: `Acción aprobada: ${action.title} (+${pointsAwarded} puntos)`,
        pointsChange: pointsAwarded,
        relatedEntityId: action.id,
        relatedEntityType: 'Action',
      }),
      this.logRepository.create({
        userId: approverId,
        type: LogType.ACTION_APPROVED,
        message: `Acción aprobada: ${action.title}`,
        relatedEntityId: action.id,
        relatedEntityType: 'Action',
      }),
    ]);

    return action;
  }

  async rejectAction(
    actionId: string,
    approverId: string,
    rejectionReason?: string
  ): Promise<Action> {
    const action = await this.getActionById(actionId);
    const approver = await this.userRepository.findOne({ where: { id: approverId } });

    if (!approver) {
      throw new AppError(404, 'Aprobador no encontrado');
    }

    if (approver.role !== UserRole.WIFE) {
      throw new AppError(403, 'Solo las esposas pueden rechazar acciones');
    }

    // Verify approver is partner
    const partnerId = await this.partnerService.getPartnerId(approverId);
    if (partnerId !== action.userId) {
      throw new AppError(403, 'Solo puedes rechazar las acciones de tu pareja');
    }

    if (action.status !== ActionStatus.PENDING) {
      throw new AppError(400, 'La acción no está pendiente');
    }

    action.status = ActionStatus.REJECTED;
    action.rejectionReason = rejectionReason || null;
    action.approvedBy = approverId;
    action.approvedAt = new Date();

    await this.actionRepository.save(action);

    // Create logs
    await this.logRepository.save([
      this.logRepository.create({
        userId: action.userId,
        type: LogType.ACTION_REJECTED,
        message: `Acción rechazada: ${action.title}`,
        relatedEntityId: action.id,
        relatedEntityType: 'Action',
      }),
      this.logRepository.create({
        userId: approverId,
        type: LogType.ACTION_REJECTED,
        message: `Acción rechazada: ${action.title}`,
        relatedEntityId: action.id,
        relatedEntityType: 'Action',
      }),
    ]);

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
