import { apiService } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Permission,
  CreatePermissionRequest,
  RespondPermissionRequest,
  GetPermissionsParams,
} from '@/types';

class PermissionsService {
  /**
   * Request permission (Husband only)
   * POST /permissions
   */
  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    const response = await apiService.post<ApiResponse<Permission>>('/permissions', data);
    return response.data;
  }

  /**
   * Get my permission requests
   * GET /permissions/my
   */
  async getMyPermissions(params?: GetPermissionsParams): Promise<PaginatedResponse<Permission>> {
    return apiService.get<PaginatedResponse<Permission>>('/permissions/my', params);
  }

  /**
   * Get partner's permission requests (Wife only)
   * GET /permissions/partner
   */
  async getPartnerPermissions(params?: GetPermissionsParams): Promise<PaginatedResponse<Permission>> {
    return apiService.get<PaginatedResponse<Permission>>('/permissions/partner', params);
  }

  /**
   * Respond to permission (Wife only)
   * POST /permissions/:id/respond
   */
  async respondToPermission(permissionId: string, data: RespondPermissionRequest): Promise<Permission> {
    const response = await apiService.post<ApiResponse<Permission>>(`/permissions/${permissionId}/respond`, data);
    return response.data;
  }

  /**
   * Get permission by id
   * GET /permissions/:id
   */
  async getPermissionById(permissionId: string): Promise<Permission> {
    const response = await apiService.get<ApiResponse<Permission>>(`/permissions/${permissionId}`);
    return response.data;
  }

  /**
   * Cancel permission (Husband only)
   * DELETE /permissions/:id
   */
  async cancelPermission(permissionId: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(`/permissions/${permissionId}`);
  }
}

export const permissionsService = new PermissionsService();
