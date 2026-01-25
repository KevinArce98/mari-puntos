import { create } from 'zustand';
import { permissionsService } from '@/services';
import {
  Permission,
  CreatePermissionRequest,
  GetPermissionsParams,
  PermissionStatus,
} from '@/types';

interface PermissionsState {
  myPermissions: Permission[];
  partnerPermissions: Permission[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMyPermissions: (params?: GetPermissionsParams) => Promise<void>;
  fetchPartnerPermissions: (params?: GetPermissionsParams) => Promise<void>;
  createPermission: (data: CreatePermissionRequest) => Promise<void>;
  respondToPermission: (permissionId: string, approved: boolean, responseMessage?: string) => Promise<void>;
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
    } catch (error: any) {
      set({ error: error.error || 'Failed to fetch permissions', isLoading: false });
      throw error;
    }
  },

  fetchPartnerPermissions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await permissionsService.getPartnerPermissions(params);
      set({ partnerPermissions: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to fetch partner permissions', isLoading: false });
      throw error;
    }
  },

  createPermission: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsService.createPermission(data);
      // Refetch my permissions
      await get().fetchMyPermissions({ status: PermissionStatus.PENDING });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to create permission', isLoading: false });
      throw error;
    }
  },

  respondToPermission: async (permissionId, approved, responseMessage) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsService.respondToPermission(permissionId, { approved, responseMessage });
      // Refetch partner permissions
      await get().fetchPartnerPermissions({ status: PermissionStatus.PENDING });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to respond to permission', isLoading: false });
      throw error;
    }
  },

  cancelPermission: async (permissionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsService.deletePermission(permissionId);
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
