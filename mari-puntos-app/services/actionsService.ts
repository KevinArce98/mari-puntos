import { apiService } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Action,
  CreateActionRequest,
  ApproveActionRequest,
  RejectActionRequest,
  GetActionsParams,
} from '@/types';

class ActionsService {
  /**
   * Create a new action (Husband only)
   * POST /actions
   */
  async createAction(data: CreateActionRequest): Promise<Action> {
    const response = await apiService.post<ApiResponse<Action>>('/actions', data);
    return response.data;
  }

  /**
   * Get current user's actions
   * GET /actions/my
   */
  async getMyActions(params?: GetActionsParams): Promise<PaginatedResponse<Action>> {
    return apiService.get<PaginatedResponse<Action>>('/actions/my', params);
  }

  /**
   * Get partner's actions (Wife only)
   * GET /actions/partner
   */
  async getPartnerActions(params?: GetActionsParams): Promise<PaginatedResponse<Action>> {
    return apiService.get<PaginatedResponse<Action>>('/actions/partner', params);
  }

  /**
   * Approve action and award points (Wife only)
   * POST /actions/:id/approve
   */
  async approveAction(actionId: string, data: ApproveActionRequest): Promise<Action> {
    const response = await apiService.post<ApiResponse<Action>>(`/actions/${actionId}/approve`, data);
    return response.data;
  }

  /**
   * Reject action (Wife only)
   * POST /actions/:id/reject
   */
  async rejectAction(actionId: string, data: RejectActionRequest): Promise<Action> {
    const response = await apiService.post<ApiResponse<Action>>(`/actions/${actionId}/reject`, data);
    return response.data;
  }
}

export const actionsService = new ActionsService();
