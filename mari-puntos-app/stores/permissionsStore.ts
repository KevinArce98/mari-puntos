import { create } from 'zustand';
import { permissionsService } from '@/services';
import {
  Permission,
  CreatePermissionRequest,
  GetPermissionsParams,
  PermissionStatus,
} from '@/types';
import logger from '@/utils/logger';

interface PermissionsState {
  myPermissions: Permission[];
  partnerPermissions: Permission[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMyPermissions: (params?: GetPermissionsParams) => Promise<void>;
  fetchPartnerPermissions: (params?: GetPermissionsParams) => Promise<void>;
  createPermission: (data: CreatePermissionRequest) => Promise<void>;
  updatePermission: (
    permissionId: string,
    data: Partial<CreatePermissionRequest>
  ) => Promise<void>;
  respondToPermission: (
    permissionId: string,
    approved: boolean,
    responseMessage?: string,
    pointsCost?: number
  ) => Promise<void>;
  cancelPermission: (permissionId: string) => Promise<void>;
  clearPermissions: () => void;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  myPermissions: [],
  partnerPermissions: [],
  isLoading: false,
  error: null,

  fetchMyPermissions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await permissionsService.getMyPermissions(params);
      set({ myPermissions: response.data, isLoading: false });
      logger.debug('My permissions fetched successfully', {
        count: response.data.length,
        params,
      });
    } catch (error: any) {
      logger.error('Failed to fetch my permissions', error, { params });
      set({ error: error.error || 'Failed to fetch permissions', isLoading: false });
      throw error;
    }
  },

  fetchPartnerPermissions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await permissionsService.getPartnerPermissions(params);
      set({ partnerPermissions: response.data, isLoading: false });
      logger.debug('Partner permissions fetched successfully', {
        count: response.data.length,
        params,
      });
    } catch (error: any) {
      logger.error('Failed to fetch partner permissions', error, { params });
      set({
        error: error.error || 'Failed to fetch partner permissions',
        isLoading: false,
      });
      throw error;
    }
  },

  createPermission: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsService.createPermission(data);
      logger.info('Permission created successfully', {
        templateId: data.templateId,
        pointsCost: 0,
      });
      // Refetch my permissions
      await get().fetchMyPermissions({ status: PermissionStatus.PENDING });
      set({ isLoading: false });
    } catch (error: any) {
      logger.error('Failed to create permission', error, { data });
      set({ error: error.error || 'Failed to create permission', isLoading: false });
      throw error;
    }
  },

  updatePermission: async (permissionId, data) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsService.updatePermission(permissionId, data);
      logger.info('Permission updated successfully', { permissionId });
      // Refetch my permissions
      await get().fetchMyPermissions();
      set({ isLoading: false });
    } catch (error: any) {
      logger.error('Failed to update permission', error, { permissionId, data });
      set({ error: error.error || 'Failed to update permission', isLoading: false });
      throw error;
    }
  },

  respondToPermission: async (permissionId, approved, responseMessage, pointsCost) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsService.respondToPermission(permissionId, {
        approved,
        responseMessage,
        pointsCost,
      });
      // Refetch partner permissions
      await get().fetchPartnerPermissions({ status: PermissionStatus.PENDING });
      // Update partner info to refresh points
      const { useUserStore } = await import('./userStore');
      await useUserStore.getState().fetchPartnerInfo();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to respond to permission', isLoading: false });
      throw error;
    }
  },

  cancelPermission: async (permissionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsService.cancelPermission(permissionId);
      // Refetch my permissions
      await get().fetchMyPermissions({ status: PermissionStatus.PENDING });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to cancel permission', isLoading: false });
      throw error;
    }
  },

  clearPermissions: () => set({ myPermissions: [], partnerPermissions: [], error: null }),
}));
