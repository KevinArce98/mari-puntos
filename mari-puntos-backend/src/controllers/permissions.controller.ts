import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PermissionsService } from '../services/permissions.service';
import {
  createPermissionSchema,
  respondPermissionSchema,
  updatePermissionSchema,
} from '../validators/schemas';
import { sendSuccess, sendCreated, sendPaginated, createPaginationMeta } from '../utils/response';
import { toPermissionDTO, toPermissionDTOList } from '../utils/mappers';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { PermissionStatus } from '../entities/Permission';
import { logger } from '../utils/logger';

export class PermissionsController {
  private permissionsService = new PermissionsService();

  /**
   * POST /permissions
   * Request a new permission
   */
  createPermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const data = createPermissionSchema.parse(req.body);

      logger.info({ message: 'Creating permission request', userId, permissionData: data });

      const permission = await this.permissionsService.createPermission(userId, {
        ...data,
        requestedDate: new Date(data.requestedDate),
      });

      logger.info({ message: 'Permission requested successfully', userId, permissionId: permission.id });

      sendCreated(res, toPermissionDTO(permission), 'Permission requested successfully');
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error creating permission');
      throw error;
    }
  };

  /**
   * GET /permissions/my
   * Get current user's permission requests
   */
  getMyPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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

      logger.debug({ message: 'User permissions retrieved', userId, total: result.total });

      sendPaginated(
        res,
        toPermissionDTOList(result.permissions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting user permissions');
      throw error;
    }
  };

  /**
   * GET /permissions/partner
   * Get partner's permission requests (for responding)
   */
  getPartnerPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
      const status = req.query.status as string | undefined;

      logger.debug({ message: 'Getting partner permissions', userId, page, limit, status });

      const result = await this.permissionsService.getPartnerPermissions(userId, {
        status: status as PermissionStatus | undefined,
        page,
        limit,
      });

      logger.debug({ message: 'Partner permissions retrieved', userId, total: result.total });

      sendPaginated(
        res,
        toPermissionDTOList(result.permissions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting partner permissions');
      throw error;
    }
  };

  /**
   * GET /permissions/:id
   * Get permission by ID
   */
  getPermissionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;

      logger.debug({ message: 'Getting permission by ID', permissionId: id });

      const permission = await this.permissionsService.getPermissionById(id);

      logger.debug({ message: 'Permission retrieved by ID', permissionId: id });

      sendSuccess(res, toPermissionDTO(permission));
    } catch (error) {
      logger.error({ err: error, permissionId: req.params.id }, 'Error getting permission by ID');
      throw error;
    }
  };

  /**
   * POST /permissions/:id/respond
   * Respond to a permission request
   */
  respondToPermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;
      const { approved, responseMessage, pointsCost } = respondPermissionSchema.parse(req.body);

      logger.info({ message: 'Responding to permission', userId, permissionId: id, approved, pointsCost });

      const permission = await this.permissionsService.respondToPermission(
        id,
        userId,
        approved,
        responseMessage,
        pointsCost
      );

      logger.info({ message: 'Permission response submitted successfully', userId, permissionId: id, approved });

      sendSuccess(
        res,
        toPermissionDTO(permission),
        approved ? 'Permission approved' : 'Permission rejected'
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId, permissionId: req.params.id }, 'Error responding to permission');
      throw error;
    }
  };

  /**
   * PATCH /permissions/:id
   * Update a pending permission request
   */
  updatePermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;
      const data = updatePermissionSchema.parse(req.body);

      // Convert requestedDate string to Date if provided
      const updateData = {
        ...data,
        requestedDate: data.requestedDate ? new Date(data.requestedDate) : undefined,
      };

      logger.info({ message: 'Updating permission', userId, permissionId: id, updateData });

      const permission = await this.permissionsService.updatePermission(id, userId, updateData);

      logger.info({ message: 'Permission updated successfully', userId, permissionId: id });

      sendSuccess(res, toPermissionDTO(permission), 'Permission updated successfully');
    } catch (error) {
      logger.error({ err: error, userId: req.userId, permissionId: req.params.id }, 'Error updating permission');
      throw error;
    }
  };

  /**
   * DELETE /permissions/:id
   * Cancel/delete a permission request (pending only)
   */
  deletePermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;

      logger.info({ message: 'Deleting permission', userId, permissionId: id });

      await this.permissionsService.deletePermission(id, userId);

      logger.info({ message: 'Permission deleted successfully', userId, permissionId: id });

      sendSuccess(res, { success: true }, 'Permission deleted successfully');
    } catch (error) {
      logger.error({ err: error, userId: req.userId, permissionId: req.params.id }, 'Error deleting permission');
      throw error;
    }
  };
}
