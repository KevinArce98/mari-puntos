import { Response } from 'express';

import { PermissionStatus } from '../entities/Permission';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PermissionsService } from '../services/permissions.service';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { logger } from '../utils/logger';
import { toPermissionDTO, toPermissionDTOList } from '../utils/mappers';
import {
  createPaginationMeta,
  sendCreated,
  sendPaginated,
  sendSuccess,
} from '../utils/response';
import {
  createPermissionSchema,
  respondPermissionSchema,
  updatePermissionSchema,
} from '../validators/schemas';

export class PermissionsController {
  private permissionsService = new PermissionsService();

  createPermission = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const data = createPermissionSchema.parse(req.body);

    logger.info({
      message: 'Creating permission request',
      userId,
      permissionData: data,
    });

    const permission = await this.permissionsService.createPermission(userId, {
      ...data,
      requestedDate: new Date(data.requestedDate),
    });

    logger.info({
      message: 'Permission requested successfully',
      userId,
      permissionId: permission.id,
    });

    sendCreated(res, toPermissionDTO(permission), 'Permission requested successfully');
  };

  getMyPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    );
    const status = req.query.status as string | undefined;

    logger.debug({ message: 'Getting user permissions', userId, page, limit, status });

    const result = await this.permissionsService.getUserPermissions(userId, {
      status: status as PermissionStatus | undefined,
      page,
      limit,
    });

    logger.debug({
      message: 'User permissions retrieved',
      userId,
      total: result.total,
    });

    sendPaginated(
      res,
      toPermissionDTOList(result.permissions),
      createPaginationMeta(page, limit, result.total)
    );
  };

  getPartnerPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    );
    const status = req.query.status as string | undefined;

    logger.debug({
      message: 'Getting partner permissions',
      userId,
      page,
      limit,
      status,
    });

    const result = await this.permissionsService.getPartnerPermissions(userId, {
      status: status as PermissionStatus | undefined,
      page,
      limit,
    });

    logger.debug({
      message: 'Partner permissions retrieved',
      userId,
      total: result.total,
    });

    sendPaginated(
      res,
      toPermissionDTOList(result.permissions),
      createPaginationMeta(page, limit, result.total)
    );
  };

  getPermissionById = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;

    logger.debug({ message: 'Getting permission by ID', permissionId: id });

    const permission = await this.permissionsService.getPermissionById(id);

    logger.debug({ message: 'Permission retrieved by ID', permissionId: id });

    sendSuccess(res, toPermissionDTO(permission));
  };

  respondToPermission = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { approved, responseMessage, pointsCost } = respondPermissionSchema.parse(
      req.body
    );

    logger.info({
      message: 'Responding to permission',
      userId,
      permissionId: id,
      approved,
      pointsCost,
    });

    const permission = await this.permissionsService.respondToPermission(
      id,
      userId,
      approved,
      responseMessage,
      pointsCost
    );

    logger.info({
      message: 'Permission response submitted successfully',
      userId,
      permissionId: id,
      approved,
    });

    sendSuccess(
      res,
      toPermissionDTO(permission),
      approved ? 'Permission approved' : 'Permission rejected'
    );
  };

  updatePermission = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;
    const data = updatePermissionSchema.parse(req.body);

    const updateData = {
      ...data,
      requestedDate: data.requestedDate ? new Date(data.requestedDate) : undefined,
    };

    logger.info({
      message: 'Updating permission',
      userId,
      permissionId: id,
      updateData,
    });

    const permission = await this.permissionsService.updatePermission(
      id,
      userId,
      updateData
    );

    logger.info({
      message: 'Permission updated successfully',
      userId,
      permissionId: id,
    });

    sendSuccess(res, toPermissionDTO(permission), 'Permission updated successfully');
  };

  deletePermission = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;

    logger.info({ message: 'Deleting permission', userId, permissionId: id });

    await this.permissionsService.deletePermission(id, userId);

    logger.info({
      message: 'Permission deleted successfully',
      userId,
      permissionId: id,
    });

    sendSuccess(res, { success: true }, 'Permission deleted successfully');
  };
}
