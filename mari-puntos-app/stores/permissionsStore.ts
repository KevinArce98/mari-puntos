import { create } from 'zustand';
import { permissionsService } from '@/services';
import {
  Permission,
  CreatePermissionRequest,
  GetPermissionsParams,
  PermissionStatus,
} from '@/types';
import { useUserStore } from './userStore';
import logger from '@/utils/logger';

interface PermissionsState {
  myPermissions: Permission[];
  partnerPermissions: Permission[];
  isLoadingMyPermissions: boolean;
  isLoadingPartnerPermissions: boolean;
  isMutating: boolean;
  /** Combined loading flag for backwards compatibility */
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
  isLoadingMyPermissions: false,
  isLoadingPartnerPermissions: false,
  isMutating: false,
  isLoading: false,
  error: null,

  fetchMyPermissions: async (params) => {
    set((s) => ({ isLoadingMyPermissions: true, isLoading: true, error: null }));
    try {
      const response = await permissionsService.getMyPermissions(params);
      set((s) => ({
        myPermissions: response.data,
        isLoadingMyPermissions: false,
        isLoading: s.isLoadingPartnerPermissions || s.isMutating,
      }));
      logger.debug('My permissions fetched successfully', {
        count: response.data.length,
        params,
      });
    } catch (error: any) {
      logger.error('Failed to fetch my permissions', error, { params });
      set((s) => ({
        error: error.error || 'Failed to fetch permissions',
        isLoadingMyPermissions: false,
        isLoading: s.isLoadingPartnerPermissions || s.isMutating,
      }));
      throw error;
    }
  },

  fetchPartnerPermissions: async (params) => {
    set((s) => ({ isLoadingPartnerPermissions: true, isLoading: true, error: null }));
    try {
      const response = await permissionsService.getPartnerPermissions(params);
      set((s) => ({
        partnerPermissions: response.data,
        isLoadingPartnerPermissions: false,
        isLoading: s.isLoadingMyPermissions || s.isMutating,
      }));
      logger.debug('Partner permissions fetched successfully', {
        count: response.data.length,
        params,
      });
    } catch (error: any) {
      logger.error('Failed to fetch partner permissions', error, { params });
      set((s) => ({
        error: error.error || 'Failed to fetch partner permissions',
        isLoadingPartnerPermissions: false,
        isLoading: s.isLoadingMyPermissions || s.isMutating,
      }));
      throw error;
    }
  },

  createPermission: async (data) => {
    set({ isMutating: true, isLoading: true, error: null });
    try {
      await permissionsService.createPermission(data);
      logger.info('Permission created successfully', { templateId: data.templateId });
      await get().fetchMyPermissions({ status: PermissionStatus.PENDING });
      set((s) => ({
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
    } catch (error: any) {
      logger.error('Failed to create permission', error, { data });
      set((s) => ({
        error: error.error || 'Failed to create permission',
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
      throw error;
    }
  },

  updatePermission: async (permissionId, data) => {
    set({ isMutating: true, isLoading: true, error: null });
    try {
      await permissionsService.updatePermission(permissionId, data);
      logger.info('Permission updated successfully', { permissionId });
      await get().fetchMyPermissions();
      set((s) => ({
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
    } catch (error: any) {
      logger.error('Failed to update permission', error, { permissionId, data });
      set((s) => ({
        error: error.error || 'Failed to update permission',
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
      throw error;
    }
  },

  respondToPermission: async (permissionId, approved, responseMessage, pointsCost) => {
    set({ isMutating: true, isLoading: true, error: null });
    try {
      await permissionsService.respondToPermission(permissionId, {
        approved,
        responseMessage,
        pointsCost,
      });
      await get().fetchPartnerPermissions({ status: PermissionStatus.PENDING });
      // Update partner info to refresh points (use getState() to avoid circular import)
      await useUserStore.getState().fetchPartnerInfo();
      set((s) => ({
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
    } catch (error: any) {
      logger.error('Failed to respond to permission', error, { permissionId });
      set((s) => ({
        error: error.error || 'Failed to respond to permission',
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
      throw error;
    }
  },

  cancelPermission: async (permissionId: string) => {
    set({ isMutating: true, isLoading: true, error: null });
    try {
      await permissionsService.cancelPermission(permissionId);
      await get().fetchMyPermissions({ status: PermissionStatus.PENDING });
      set((s) => ({
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
    } catch (error: any) {
      logger.error('Failed to cancel permission', error, { permissionId });
      set((s) => ({
        error: error.error || 'Failed to cancel permission',
        isMutating: false,
        isLoading: s.isLoadingMyPermissions || s.isLoadingPartnerPermissions,
      }));
      throw error;
    }
  },

  clearPermissions: () => set({ myPermissions: [], partnerPermissions: [], error: null }),
}));
