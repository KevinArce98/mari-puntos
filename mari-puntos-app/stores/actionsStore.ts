import { create } from 'zustand';
import { actionsService } from '@/services';
import {
  Action,
  CreateActionRequest,
  GetActionsParams,
  ActionStatus,
} from '@/types';
import logger from '@/utils/logger';

interface ActionsState {
  myActions: Action[];
  partnerActions: Action[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMyActions: (params?: GetActionsParams) => Promise<void>;
  fetchPartnerActions: (params?: GetActionsParams) => Promise<void>;
  createAction: (data: CreateActionRequest) => Promise<void>;
  approveAction: (actionId: string, pointsAwarded: number) => Promise<void>;
  rejectAction: (actionId: string, rejectionReason: string) => Promise<void>;
  clearActions: () => void;
}

export const useActionsStore = create<ActionsState>((set, get) => ({
  myActions: [],
  partnerActions: [],
  isLoading: false,
  error: null,

  fetchMyActions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await actionsService.getMyActions(params);
      set({ myActions: response.data, isLoading: false });
      logger.debug('My actions fetched successfully', { count: response.data.length, params });
    } catch (error: any) {
      logger.error('Failed to fetch my actions', error, { params });
      set({ error: error.error || 'Failed to fetch actions', isLoading: false });
      throw error;
    }
  },

  fetchPartnerActions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await actionsService.getPartnerActions(params);
      set({ partnerActions: response.data, isLoading: false });
      logger.debug('Partner actions fetched successfully', { count: response.data.length, params });
    } catch (error: any) {
      logger.error('Failed to fetch partner actions', error, { params });
      set({ error: error.error || 'Failed to fetch partner actions', isLoading: false });
      throw error;
    }
  },

  createAction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await actionsService.createAction(data);
      logger.info('Action created successfully', { title: data.title });
      // Refetch my actions
      await get().fetchMyActions({ status: ActionStatus.PENDING });
      set({ isLoading: false });
    } catch (error: any) {
      logger.error('Failed to create action', error, { data });
      set({ error: error.error || 'Failed to create action', isLoading: false });
      throw error;
    }
  },

  approveAction: async (actionId, pointsAwarded) => {
    set({ isLoading: true, error: null });
    try {
      await actionsService.approveAction(actionId, { pointsAwarded });
      logger.info('Action approved successfully', { actionId, pointsAwarded });
      // Refetch partner actions
      await get().fetchPartnerActions({ status: ActionStatus.PENDING });
      set({ isLoading: false });
    } catch (error: any) {
      logger.error('Failed to approve action', error, { actionId, pointsAwarded });
      set({ error: error.error || 'Failed to approve action', isLoading: false });
      throw error;
    }
  },

  rejectAction: async (actionId, rejectionReason) => {
    set({ isLoading: true, error: null });
    try {
      await actionsService.rejectAction(actionId, { rejectionReason });
      logger.info('Action rejected successfully', { actionId, rejectionReason });
      // Refetch partner actions
      await get().fetchPartnerActions({ status: ActionStatus.PENDING });
      set({ isLoading: false });
    } catch (error: any) {
      logger.error('Failed to reject action', error, { actionId, rejectionReason });
      set({ error: error.error || 'Failed to reject action', isLoading: false });
      throw error;
    }
  },

  clearActions: () => set({ myActions: [], partnerActions: [], error: null }),
}));
