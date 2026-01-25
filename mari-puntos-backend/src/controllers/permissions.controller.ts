import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PermissionsService } from '../services/permissions.service';
import {
  createPermissionSchema,
  respondPermissionSchema,
} from '../validators/schemas';
import { sendSuccess, sendCreated, sendPaginated, createPaginationMeta } from '../utils/response';
import { toPermissionDTO, toPermissionDTOList } from '../utils/mappers';
import { PAGINATION_DEFAULTS } from '../shared/constants';

export class PermissionsController {
  private permissionsService = new PermissionsService();

  /**
   * POST /permissions
   * Request a new permission (Husband only)
   */
  createPermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const data = createPermissionSchema.parse(req.body);

      const permission = await this.permissionsService.createPermission(userId, {
        ...data,
        requestedDate: new Date(data.requestedDate),
      });

      sendCreated(res, toPermissionDTO(permission), 'Permission requested successfully');
    } catch (error) {
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

      const result = await this.permissionsService.getUserPermissions(userId, {
        status: status as any,
        page,
        limit,
      });

      sendPaginated(
        res,
        toPermissionDTOList(result.permissions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /permissions/partner
   * Get partner's permission requests (Wife only - for responding)
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

      const result = await this.permissionsService.getPartnerPermissions(userId, {
        status: status as any,
        page,
        limit,
      });

      sendPaginated(
        res,
        toPermissionDTOList(result.permissions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /permissions/:id
   * Get permission by ID
   */
  getPermissionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const permission = await this.permissionsService.getPermissionById(id);

      sendSuccess(res, toPermissionDTO(permission));
    } catch (error) {
      throw error;
    }
  };

  /**
   * POST /permissions/:id/respond
   * Respond to a permission request (Wife only)
   */
  respondToPermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { approved, responseMessage } = respondPermissionSchema.parse(req.body);

      const permission = await this.permissionsService.respondToPermission(
        id,
        userId,
        approved,
        responseMessage
      );

      sendSuccess(
        res,
        toPermissionDTO(permission),
        approved ? 'Permission approved' : 'Permission rejected'
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * DELETE /permissions/:id
   * Cancel/delete a permission request (Husband only, pending only)
   */
  deletePermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await this.permissionsService.deletePermission(id, userId);

      sendSuccess(res, { success: true }, 'Permission deleted successfully');
    } catch (error) {
      throw error;
    }
  };
}
