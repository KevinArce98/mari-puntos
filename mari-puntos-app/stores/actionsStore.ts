import { create } from 'zustand';

import { actionsService } from '@/services';
import { useUserStore } from '@/stores/userStore';
import { Action, ActionStatus, CreateActionRequest, GetActionsParams } from '@/types';
import { getErrorMessage } from '@/utils/errorMessage';
import logger from '@/utils/logger';

/** Deduplicate an array of objects by `id`, keeping the first occurrence. */
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ActionsState {
  myActions: Action[];
  partnerActions: Action[];
  isLoadingMyActions: boolean;
  isLoadingPartnerActions: boolean;
  isMutating: boolean;
  /** Combined loading flag for backwards compatibility */
  isLoading: boolean;
  error: string | null;
  myActionsPagination: PaginationMeta | null;
  partnerActionsPagination: PaginationMeta | null;

  // Actions
  fetchMyActions: (params?: GetActionsParams, append?: boolean) => Promise<void>;
  fetchPartnerActions: (params?: GetActionsParams, append?: boolean) => Promise<void>;
  createAction: (data: CreateActionRequest) => Promise<void>;
  approveAction: (actionId: string, pointsAwarded: number) => Promise<void>;
  rejectAction: (actionId: string, rejectionReason: string) => Promise<void>;
  clearActions: () => void;
}

export const useActionsStore = create<ActionsState>((set, get) => ({
  myActions: [],
  partnerActions: [],
  isLoadingMyActions: false,
  isLoadingPartnerActions: false,
  isMutating: false,
  isLoading: false,
  error: null,
  myActionsPagination: null,
  partnerActionsPagination: null,

  fetchMyActions: async (params, append = false) => {
    set((s) => ({ isLoadingMyActions: true, isLoading: true, error: null }));
    try {
      const response = await actionsService.getMyActions(params);
      set((state) => ({
        myActions: append
          ? dedupeById([...state.myActions, ...response.data])
          : response.data,
        myActionsPagination: response.pagination ?? null,
        isLoadingMyActions: false,
        isLoading: state.isLoadingPartnerActions || state.isMutating,
      }));
      logger.debug('My actions fetched successfully', {
        count: response.data.length,
        params,
      });
    } catch (error: unknown) {
      logger.error('Failed to fetch my actions', error as Error, { params });
      set((s) => ({
        error: getErrorMessage(error),
        isLoadingMyActions: false,
        isLoading: s.isLoadingPartnerActions || s.isMutating,
      }));
      throw error;
    }
  },

  fetchPartnerActions: async (params, append = false) => {
    set((s) => ({ isLoadingPartnerActions: true, isLoading: true, error: null }));
    try {
      const response = await actionsService.getPartnerActions(params);
      set((state) => ({
        partnerActions: append
          ? dedupeById([...state.partnerActions, ...response.data])
          : response.data,
        partnerActionsPagination: response.pagination ?? null,
        isLoadingPartnerActions: false,
        isLoading: state.isLoadingMyActions || state.isMutating,
      }));
      logger.debug('Partner actions fetched successfully', {
        count: response.data.length,
        params,
      });
    } catch (error: unknown) {
      logger.error('Failed to fetch partner actions', error as Error, { params });
      set((s) => ({
        error: getErrorMessage(error),
        isLoadingPartnerActions: false,
        isLoading: s.isLoadingMyActions || s.isMutating,
      }));
      throw error;
    }
  },

  createAction: async (data) => {
    set({ isMutating: true, isLoading: true, error: null });
    try {
      await actionsService.createAction(data);
      logger.info('Action created successfully', { title: data.title });
      await get().fetchMyActions({ status: ActionStatus.PENDING });
      set((s) => ({
        isMutating: false,
        isLoading: s.isLoadingMyActions || s.isLoadingPartnerActions,
      }));
    } catch (error: unknown) {
      logger.error('Failed to create action', error as Error, { data });
      set((s) => ({
        error: getErrorMessage(error),
        isMutating: false,
        isLoading: s.isLoadingMyActions || s.isLoadingPartnerActions,
      }));
      throw error;
    }
  },

  approveAction: async (actionId, pointsAwarded) => {
    set({ isMutating: true, isLoading: true, error: null });
    try {
      await actionsService.approveAction(actionId, { pointsAwarded });
      logger.info('Action approved successfully', { actionId, pointsAwarded });
      await get().fetchPartnerActions({ status: ActionStatus.PENDING });
      // Refresh partner's point total (points are awarded to them, not us)
      useUserStore
        .getState()
        .fetchStats()
        .catch(() => {});
      set((s) => ({
        isMutating: false,
        isLoading: s.isLoadingMyActions || s.isLoadingPartnerActions,
      }));
    } catch (error: unknown) {
      logger.error('Failed to approve action', error as Error, {
        actionId,
        pointsAwarded,
      });
      set((s) => ({
        error: getErrorMessage(error),
        isMutating: false,
        isLoading: s.isLoadingMyActions || s.isLoadingPartnerActions,
      }));
      throw error;
    }
  },

  rejectAction: async (actionId, rejectionReason) => {
    set({ isMutating: true, isLoading: true, error: null });
    try {
      await actionsService.rejectAction(actionId, { rejectionReason });
      logger.info('Action rejected successfully', { actionId, rejectionReason });
      await get().fetchPartnerActions({ status: ActionStatus.PENDING });
      useUserStore
        .getState()
        .fetchStats()
        .catch(() => {});
      set((s) => ({
        isMutating: false,
        isLoading: s.isLoadingMyActions || s.isLoadingPartnerActions,
      }));
    } catch (error: unknown) {
      logger.error('Failed to reject action', error as Error, {
        actionId,
        rejectionReason,
      });
      set((s) => ({
        error: getErrorMessage(error),
        isMutating: false,
        isLoading: s.isLoadingMyActions || s.isLoadingPartnerActions,
      }));
      throw error;
    }
  },

  clearActions: () => set({ myActions: [], partnerActions: [], error: null }),
}));
