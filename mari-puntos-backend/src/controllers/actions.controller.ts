import { Response } from 'express';

import { ActionStatus } from '../entities/Action';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ActionsService } from '../services/actions.service';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { logger } from '../utils/logger';
import { toActionDTO, toActionDTOList } from '../utils/mappers';
import {
  createPaginationMeta,
  sendCreated,
  sendPaginated,
  sendSuccess,
} from '../utils/response';
import {
  approveActionSchema,
  createActionSchema,
  rejectActionSchema,
  updateActionSchema,
} from '../validators/schemas';

export class ActionsController {
  private actionsService = new ActionsService();

  createAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const data = createActionSchema.parse(req.body);

      logger.info({ message: 'Creating action', userId, actionData: data });

      const action = await this.actionsService.createAction(userId, data);

      logger.info({
        message: 'Action created successfully',
        userId,
        actionId: action.id,
      });

      sendCreated(res, toActionDTO(action), 'Action created successfully');
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error creating action');
      throw error;
    }
  };

  getMyActions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
      const status = req.query.status as string | undefined;

      logger.debug({ message: 'Getting user actions', userId, page, limit, status });

      const result = await this.actionsService.getUserActions(userId, {
        status: status as ActionStatus | undefined,
        page,
        limit,
      });

      logger.debug({ message: 'User actions retrieved', userId, total: result.total });

      sendPaginated(
        res,
        toActionDTOList(result.actions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting user actions');
      throw error;
    }
  };

  getPartnerActions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
      const limit = Math.min(
        parseInt(req.query.limit as string) || PAGINATION_DEFAULTS.LIMIT,
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
      const status = req.query.status as string | undefined;

      logger.debug({ message: 'Getting partner actions', userId, page, limit, status });

      const result = await this.actionsService.getPartnerActions(userId, {
        status: status as ActionStatus | undefined,
        page,
        limit,
      });

      logger.debug({ message: 'Partner actions retrieved', userId, total: result.total });

      sendPaginated(
        res,
        toActionDTOList(result.actions),
        createPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Error getting partner actions');
      throw error;
    }
  };

  getActionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;

      logger.debug({ message: 'Getting action by ID', actionId: id, userId });

      const action = await this.actionsService.getActionById(id, userId);

      logger.debug({ message: 'Action retrieved', actionId: id });

      sendSuccess(res, toActionDTO(action));
    } catch (error) {
      logger.error(
        { err: error, actionId: req.params.id, userId: req.userId },
        'Error getting action by ID'
      );
      throw error;
    }
  };

  updateAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;
      const data = updateActionSchema.parse(req.body);

      logger.info({ message: 'Updating action', actionId: id, userId, updateData: data });

      const action = await this.actionsService.updateAction(id, userId, data);

      logger.info({ message: 'Action updated successfully', actionId: id, userId });

      sendSuccess(res, toActionDTO(action), 'Action updated successfully');
    } catch (error) {
      logger.error(
        { err: error, actionId: req.params.id, userId: req.userId },
        'Error updating action'
      );
      throw error;
    }
  };

  approveAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;
      const { pointsAwarded } = approveActionSchema.parse(req.body);

      logger.info({ message: 'Approving action', actionId: id, userId, pointsAwarded });

      const action = await this.actionsService.approveAction(id, userId, pointsAwarded);

      logger.info({
        message: 'Action approved successfully',
        actionId: id,
        userId,
        pointsAwarded,
      });

      sendSuccess(res, toActionDTO(action), 'Action approved successfully');
    } catch (error) {
      logger.error(
        { err: error, actionId: req.params.id, userId: req.userId },
        'Error approving action'
      );
      throw error;
    }
  };

  rejectAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;
      const { rejectionReason } = rejectActionSchema.parse(req.body);

      logger.info({ message: 'Rejecting action', actionId: id, userId, rejectionReason });

      const action = await this.actionsService.rejectAction(id, userId, rejectionReason);

      logger.info({ message: 'Action rejected successfully', actionId: id, userId });

      sendSuccess(res, toActionDTO(action), 'Action rejected');
    } catch (error) {
      logger.error(
        { err: error, actionId: req.params.id, userId: req.userId },
        'Error rejecting action'
      );
      throw error;
    }
  };

  deleteAction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;

      logger.info({ message: 'Deleting action', actionId: id, userId });

      await this.actionsService.deleteAction(id, userId);

      logger.info({ message: 'Action deleted successfully', actionId: id, userId });

      sendSuccess(res, null, 'Action deleted successfully');
    } catch (error) {
      logger.error(
        { err: error, actionId: req.params.id, userId: req.userId },
        'Error deleting action'
      );
      throw error;
    }
  };
}
