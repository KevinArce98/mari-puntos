import { apiService } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Permission,
  PermissionTemplate,
  CreatePermissionRequest,
  CreatePermissionTemplateRequest,
  RespondPermissionRequest,
  GetPermissionsParams,
  GetPermissionTemplatesParams,
} from '@/types';

class PermissionsService {
  // ============================================
  // Permission Templates
  // ============================================

  /**
   * Get permission templates
   * GET /permission-templates
   */
  async getTemplates(
    params?: GetPermissionTemplatesParams
  ): Promise<PaginatedResponse<PermissionTemplate>> {
    return apiService.get<PaginatedResponse<PermissionTemplate>>(
      '/permission-templates',
      params
    );
  }

  /**
   * Get system permission templates (predefined)
   * GET /permission-templates/system
   */
  async getSystemTemplates(): Promise<PermissionTemplate[]> {
    const response = await apiService.get<ApiResponse<PermissionTemplate[]>>(
      '/permission-templates/system'
    );
    return response.data;
  }

  /**
   * Create custom permission template
   * POST /permission-templates
   */
  async createTemplate(
    data: CreatePermissionTemplateRequest
  ): Promise<PermissionTemplate> {
    const response = await apiService.post<ApiResponse<PermissionTemplate>>(
      '/permission-templates',
      data
    );
    return response.data;
  }

  /**
   * Update permission template
   * PATCH /permission-templates/:id
   */
  async updateTemplate(
    templateId: string,
    data: Partial<CreatePermissionTemplateRequest>
  ): Promise<PermissionTemplate> {
    const response = await apiService.patch<ApiResponse<PermissionTemplate>>(
      `/permission-templates/${templateId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete permission template
   * DELETE /permission-templates/:id
   */
  async deleteTemplate(templateId: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(`/permission-templates/${templateId}`);
  }

  // ============================================
  // Permissions
  // ============================================

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
  async getMyPermissions(
    params?: GetPermissionsParams
  ): Promise<PaginatedResponse<Permission>> {
    return apiService.get<PaginatedResponse<Permission>>('/permissions/my', params);
  }

  /**
   * Get partner's permission requests (Wife only)
   * GET /permissions/partner
   */
  async getPartnerPermissions(
    params?: GetPermissionsParams
  ): Promise<PaginatedResponse<Permission>> {
    return apiService.get<PaginatedResponse<Permission>>('/permissions/partner', params);
  }

  /**
   * Respond to permission (Wife only)
   * POST /permissions/:id/respond
   */
  async respondToPermission(
    permissionId: string,
    data: RespondPermissionRequest
  ): Promise<Permission> {
    const response = await apiService.post<ApiResponse<Permission>>(
      `/permissions/${permissionId}/respond`,
      data
    );
    return response.data;
  }

  /**
   * Get permission by id
   * GET /permissions/:id
   */
  async getPermissionById(permissionId: string): Promise<Permission> {
    const response = await apiService.get<ApiResponse<Permission>>(
      `/permissions/${permissionId}`
    );
    return response.data;
  }

  /**
   * Update permission (only pending)
   * PATCH /permissions/:id
   */
  async updatePermission(
    permissionId: string,
    data: Partial<CreatePermissionRequest>
  ): Promise<Permission> {
    const response = await apiService.patch<ApiResponse<Permission>>(
      `/permissions/${permissionId}`,
      data
    );
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
