import { AppDataSource } from '../config/db';
import { Permission, PermissionStatus, PermissionType } from '../entities/Permission';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { PartnerService } from './partner.service';
import { PointsService } from './points.service';

interface CreatePermissionData {
  title: string;
  description?: string;
  type: string;
  requestedDate: Date;
  durationHours: number;
  pointsCost: number;
}

export class PermissionsService {
  private permissionRepository = AppDataSource.getRepository(Permission);
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private partnerService = new PartnerService();
  private pointsService = new PointsService();

  async createPermission(
    userId: string,
    data: CreatePermissionData
  ): Promise<Permission> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Verify user has partner
    const partnerId = await this.partnerService.getPartnerId(userId);
    if (!partnerId) {
      throw new AppError(400, 'Debes tener una pareja para solicitar permisos');
    }

    const permission = this.permissionRepository.create({
      requesterId: userId,
      title: data.title,
      description: data.description,
      type: data.type as PermissionType,
      requestedDate: data.requestedDate,
      durationHours: data.durationHours,
      pointsCost: data.pointsCost,
      status: PermissionStatus.PENDING,
    });

    await this.permissionRepository.save(permission);

    // Create log
    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.PERMISSION_REQUESTED,
        message: `Permiso solicitado: ${permission.title}`,
        relatedEntityId: permission.id,
        relatedEntityType: 'Permission',
      })
    );

    return permission;
  }

  async getPermissionById(permissionId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
      relations: ['requester', 'approver'],
    });

    if (!permission) {
      throw new AppError(404, 'Permiso no encontrado');
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
      throw new AppError(404, 'Pareja no encontrada');
    }

    return this.getUserPermissions(partnerId, filters);
  }

  async respondToPermission(
    permissionId: string,
    approverId: string,
    approved: boolean,
    responseMessage?: string
  ): Promise<Permission> {
    const permission = await this.getPermissionById(permissionId);
    const approver = await this.userRepository.findOne({ where: { id: approverId } });

    if (!approver) {
      throw new AppError(404, 'Aprobador no encontrado');
    }

    // Verify approver is partner
    const partnerId = await this.partnerService.getPartnerId(approverId);
    if (partnerId !== permission.requesterId) {
      throw new AppError(403, 'Solo puedes responder a los permisos de tu pareja');
    }

    if (permission.status !== PermissionStatus.PENDING) {
      throw new AppError(400, 'El permiso no está pendiente');
    }

    // If approving, validate requester has enough points
    if (approved && permission.pointsCost > 0) {
      const requester = await this.userRepository.findOne({
        where: { id: permission.requesterId },
      });

      if (!requester) {
        throw new AppError(404, 'Solicitante no encontrado');
      }

      if (requester.totalPoints < permission.pointsCost) {
        throw new AppError(400, `El solicitante no tiene suficientes puntos.`);
      }
    }

    permission.status = approved ? PermissionStatus.APPROVED : PermissionStatus.REJECTED;
    permission.approverId = approverId;
    permission.respondedAt = new Date();
    permission.responseMessage = responseMessage || null;

    await this.permissionRepository.save(permission);

    // Deduct points if approved and pointsCost is set
    if (approved && permission.pointsCost > 0) {
      await this.pointsService.deductPoints(
        permission.requesterId,
        permission.pointsCost,
        `Permiso aprobado: ${permission.title}`
      );
    }

    // Create logs
    const logType = approved ? LogType.PERMISSION_APPROVED : LogType.PERMISSION_REJECTED;
    const message = approved
      ? `Permiso aprobado: ${permission.title}`
      : `Permiso rechazado: ${permission.title}`;

    await this.logRepository.save([
      this.logRepository.create({
        userId: permission.requesterId,
        type: logType,
        message,
        pointsChange: approved && permission.pointsCost > 0 ? -permission.pointsCost : 0,
        relatedEntityId: permission.id,
        relatedEntityType: 'Permission',
      }),
      this.logRepository.create({
        userId: approverId,
        type: logType,
        message: approved
          ? `Permiso aprobado: ${permission.title}`
          : `Permiso rechazado: ${permission.title}`,
        relatedEntityId: permission.id,
        relatedEntityType: 'Permission',
      }),
    ]);

    return permission;
  }

  async updatePermission(
    permissionId: string,
    userId: string,
    data: Partial<Permission>
  ): Promise<Permission> {
    const permission = await this.getPermissionById(permissionId);

    if (permission.requesterId !== userId) {
      throw new AppError(403, 'Solo puedes actualizar tus propios permisos');
    }

    if (permission.status !== PermissionStatus.PENDING) {
      throw new AppError(400, 'Solo puedes actualizar permisos pendientes');
    }

    Object.assign(permission, data);
    await this.permissionRepository.save(permission);

    return permission;
  }

  async deletePermission(permissionId: string, userId: string): Promise<void> {
    const permission = await this.getPermissionById(permissionId);

    if (permission.requesterId !== userId) {
      throw new AppError(403, 'Solo puedes eliminar tus propios permisos');
    }

    if (permission.status !== PermissionStatus.PENDING) {
      throw new AppError(400, 'Solo puedes eliminar permisos pendientes');
    }

    await this.permissionRepository.remove(permission);
  }
}
