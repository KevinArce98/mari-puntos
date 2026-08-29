import {
  Action,
  ApiResponse,
  ApproveActionRequest,
  CreateActionRequest,
  GetActionsParams,
  PaginatedResponse,
  RejectActionRequest,
} from '@/types';

import { apiService } from './api';

class ActionsService {
  async createAction(data: CreateActionRequest): Promise<Action> {
    const response = await apiService.post<ApiResponse<Action>>('/actions', data);
    return response.data;
  }

  async getMyActions(params?: GetActionsParams): Promise<PaginatedResponse<Action>> {
    return apiService.get<PaginatedResponse<Action>>('/actions/my', params);
  }

  async getPartnerActions(params?: GetActionsParams): Promise<PaginatedResponse<Action>> {
    return apiService.get<PaginatedResponse<Action>>('/actions/partner', params);
  }

  async approveAction(actionId: string, data: ApproveActionRequest): Promise<Action> {
    const response = await apiService.post<ApiResponse<Action>>(
      `/actions/${actionId}/approve`,
      data
    );
    return response.data;
  }

  async rejectAction(actionId: string, data: RejectActionRequest): Promise<Action> {
    const response = await apiService.post<ApiResponse<Action>>(
      `/actions/${actionId}/reject`,
      data
    );
    return response.data;
  }
}

export const actionsService = new ActionsService();
