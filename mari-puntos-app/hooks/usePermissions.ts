import { useCallback } from 'react';

import { useFocusEffect } from 'expo-router';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { permissionsService } from '@/services';
import { useUserStore } from '@/stores';
import { CreatePermissionRequest, RespondPermissionRequest } from '@/types';
import { getErrorMessage } from '@/utils/errorMessage';

export const usePermissions = () => {
  const user = useUserStore((s) => s.user);
  const queryClient = useQueryClient();

  const myQuery = useQuery({
    queryKey: queryKeys.permissions.mine(),
    queryFn: async () => (await permissionsService.getMyPermissions()).data,
    enabled: !!user,
  });

  const partnerQuery = useQuery({
    queryKey: queryKeys.permissions.partner(),
    queryFn: async () => (await permissionsService.getPartnerPermissions()).data,
    enabled: !!user?.hasPartner,
  });

  useFocusEffect(
    useCallback(() => {
      if (user) myQuery.refetch();
      if (user?.hasPartner) partnerQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.hasPartner])
  );

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

  const myPermissions = myQuery.data ?? [];
  const partnerPermissions = partnerQuery.data ?? [];
  const pendingPermissions = partnerPermissions.filter((p) => p.status === 'pending');

  return {
    myPermissions,
    partnerPermissions,
    isLoading: myQuery.isLoading || partnerQuery.isLoading,
    error: myQuery.error
      ? getErrorMessage(myQuery.error)
      : partnerQuery.error
        ? getErrorMessage(partnerQuery.error)
        : null,
    pendingCount: pendingPermissions.length,
    pendingPermissions,
    requestPermission,
    updatePermission,
    respondToPermission,
    cancelPermission,
    refetch: async () => {
      await Promise.all([
        myQuery.refetch(),
        ...(user?.hasPartner ? [partnerQuery.refetch()] : []),
      ]);
    },
  };
};
