import {
  ApiResponse,
  CreatePermissionRequest,
  CreatePermissionTemplateRequest,
  GetPermissionTemplatesParams,
  GetPermissionsParams,
  PaginatedResponse,
  Permission,
  PermissionTemplate,
  RespondPermissionRequest,
} from '@/types';

import { apiService } from './api';

class PermissionsService {
  async getTemplates(
    params?: GetPermissionTemplatesParams
  ): Promise<PaginatedResponse<PermissionTemplate>> {
    return apiService.get<PaginatedResponse<PermissionTemplate>>(
      '/permission-templates',
      params
    );
  }

  async getSystemTemplates(): Promise<PermissionTemplate[]> {
    const response = await apiService.get<ApiResponse<PermissionTemplate[]>>(
      '/permission-templates/system'
    );
    return response.data;
  }

  async createTemplate(
    data: CreatePermissionTemplateRequest
  ): Promise<PermissionTemplate> {
    const response = await apiService.post<ApiResponse<PermissionTemplate>>(
      '/permission-templates',
      data
    );
    return response.data;
  }

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

  async deleteTemplate(templateId: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(`/permission-templates/${templateId}`);
  }

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    const response = await apiService.post<ApiResponse<Permission>>('/permissions', data);
    return response.data;
  }

  async getMyPermissions(
    params?: GetPermissionsParams
  ): Promise<PaginatedResponse<Permission>> {
    return apiService.get<PaginatedResponse<Permission>>('/permissions/my', params);
  }

  async getPartnerPermissions(
    params?: GetPermissionsParams
  ): Promise<PaginatedResponse<Permission>> {
    return apiService.get<PaginatedResponse<Permission>>('/permissions/partner', params);
  }

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

  async getPermissionById(permissionId: string): Promise<Permission> {
    const response = await apiService.get<ApiResponse<Permission>>(
      `/permissions/${permissionId}`
    );
    return response.data;
  }

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

  async cancelPermission(permissionId: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(`/permissions/${permissionId}`);
  }
}

export const permissionsService = new PermissionsService();
