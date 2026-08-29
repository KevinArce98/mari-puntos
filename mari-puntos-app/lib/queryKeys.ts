import type {
  GetActionsParams,
  GetPermissionsParams,
  GetPointsHistoryParams,
} from '@/types';

export const queryKeys = {
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    stats: () => [...queryKeys.user.all, 'stats'] as const,
    partner: () => [...queryKeys.user.all, 'partner'] as const,
    achievements: () => [...queryKeys.user.all, 'achievements'] as const,
  },
  points: {
    all: ['points'] as const,
    history: (params?: GetPointsHistoryParams) =>
      [...queryKeys.points.all, 'history', params ?? {}] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    mine: (params?: GetPermissionsParams) =>
      [...queryKeys.permissions.all, 'mine', params ?? {}] as const,
    partner: (params?: GetPermissionsParams) =>
      [...queryKeys.permissions.all, 'partner', params ?? {}] as const,
    templates: () => [...queryKeys.permissions.all, 'templates'] as const,
  },
  actions: {
    all: ['actions'] as const,
    mine: (params?: GetActionsParams) =>
      [...queryKeys.actions.all, 'mine', params ?? {}] as const,
    partner: (params?: GetActionsParams) =>
      [...queryKeys.actions.all, 'partner', params ?? {}] as const,
  },
  streak: {
    all: ['streak'] as const,
    current: () => [...queryKeys.streak.all, 'current'] as const,
  },
} as const;
