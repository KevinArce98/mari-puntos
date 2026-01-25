import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ActionsService } from '../services/actions.service';
import {
  createActionSchema,
  updateActionSchema,
  approveActionSchema,
  rejectActionSchema,
} from '../validators/schemas';
import { sendSuccess, sendCreated, sendPaginated, createPaginationMeta } from '../utils/response';
import { toActionDTO, toActionDTOList } from '../utils/mappers';
import { PAGINATION_DEFAULTS } from '../shared/constants';

export class ActionsController {
  private actionsService = new ActionsService();

  /**
   * POST /actions
   * Create a new action (Husband only)
   */
  createAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const data = createActionSchema.parse(req.body);

      const action = await this.actionsService.createAction(userId, data);

      sendCreated(res, toActionDTO(action), 'Action created successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /actions/my
   * Get current user's actions
   */
  getMyActions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
      const status = req.query.status as string | undefined;

      const result = await this.actionsService.getUserActions(userId, {
        status: status as any,
        page,
        limit,
      });

      sendPaginated(
        res,
        toActionDTOList(result.actions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /actions/partner
   * Get partner's actions (Wife only - for evaluation)
   */
  getPartnerActions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
      const status = req.query.status as string | undefined;

      const result = await this.actionsService.getPartnerActions(userId, {
        status: status as any,
        page,
        limit,
      });

      sendPaginated(
        res,
        toActionDTOList(result.actions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * GET /actions/:id
   * Get action by ID
   */
  getActionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const action = await this.actionsService.getActionById(id);

      sendSuccess(res, toActionDTO(action));
    } catch (error) {
      throw error;
    }
  };

  /**
   * PUT /actions/:id
   * Update an action (only pending actions, owner only)
   */
  updateAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const data = updateActionSchema.parse(req.body);

      const action = await this.actionsService.updateAction(id, userId, data);

      sendSuccess(res, toActionDTO(action), 'Action updated successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * POST /actions/:id/approve
   * Approve action and award points (Wife only)
   */
  approveAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { pointsAwarded } = approveActionSchema.parse(req.body);

      const action = await this.actionsService.approveAction(id, userId, pointsAwarded);

      sendSuccess(res, toActionDTO(action), 'Action approved successfully');
    } catch (error) {
      throw error;
    }
  };

  /**
   * POST /actions/:id/reject
   * Reject action (Wife only)
   */
  rejectAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { rejectionReason } = rejectActionSchema.parse(req.body);

      const action = await this.actionsService.rejectAction(id, userId, rejectionReason);

      sendSuccess(res, toActionDTO(action), 'Action rejected');
    } catch (error) {
      throw error;
    }
  };

  /**
   * DELETE /actions/:id
   * Delete an action (only pending actions, owner only)
   */
  deleteAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await this.actionsService.deleteAction(id, userId);

      sendSuccess(res, null, 'Action deleted successfully');
    } catch (error) {
      throw error;
    }
  };
}
