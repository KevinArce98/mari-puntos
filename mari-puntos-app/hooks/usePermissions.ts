import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { permissionsService } from '@/services';
import { useUserStore } from '@/stores';
import {
  CreatePermissionRequest,
  PermissionStatus,
  RespondPermissionRequest,
} from '@/types';

import { useInfiniteList } from './useInfiniteList';
import { usePendingPermissionsCount } from './usePendingPermissionsCount';

interface UsePermissionsOptions {
  status?: PermissionStatus | null;
}

export const usePermissions = (options?: UsePermissionsOptions) => {
  const user = useUserStore((s) => s.user);
  const queryClient = useQueryClient();
  const status = options?.status ?? undefined;

  const mine = useInfiniteList({
    queryKey: queryKeys.permissions.mine({ status }),
    fetchPage: ({ page, limit }) =>
      permissionsService.getMyPermissions({ page, limit, status }),
    enabled: !!user,
  });

  const partner = useInfiniteList({
    queryKey: queryKeys.permissions.partner({ status }),
    fetchPage: ({ page, limit }) =>
      permissionsService.getPartnerPermissions({ page, limit, status }),
    enabled: !!user?.hasPartner,
  });

  const pendingCount = usePendingPermissionsCount('partner');

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });

  const requestPermission = async (data: CreatePermissionRequest) => {
    await permissionsService.createPermission(data);
    await invalidate();
  };

  const updatePermission = async (
    permissionId: string,
    data: Partial<CreatePermissionRequest>
  ) => {
    await permissionsService.updatePermission(permissionId, data);
    await invalidate();
  };

  const respondToPermission = async (
    permissionId: string,
    data: RespondPermissionRequest
  ) => {
    await permissionsService.respondToPermission(permissionId, data);
    await invalidate();
    useUserStore
      .getState()
      .fetchStats()
      .catch(() => {});
    useUserStore
      .getState()
      .fetchPartnerInfo()
      .catch(() => {});
  };

  const cancelPermission = async (permissionId: string) => {
    await permissionsService.cancelPermission(permissionId);
    await invalidate();
  };

  return {
    myPermissions: mine.items,
    partnerPermissions: partner.items,
    myPermissionsPagination: mine.pagination,
    partnerPermissionsPagination: partner.pagination,
    loadMoreMyPermissions: mine.loadMore,
    loadMorePartnerPermissions: partner.loadMore,
    isFetchingMoreMyPermissions: mine.isFetchingNextPage,
    isFetchingMorePartnerPermissions: partner.isFetchingNextPage,
    isLoading: mine.isLoading || partner.isLoading,
    error: mine.error ?? partner.error,
    pendingCount,
    requestPermission,
    updatePermission,
    respondToPermission,
    cancelPermission,
    refetch: async () => {
      await Promise.all([
        mine.refetch(),
        ...(user?.hasPartner ? [partner.refetch()] : []),
      ]);
    },
  };
};
