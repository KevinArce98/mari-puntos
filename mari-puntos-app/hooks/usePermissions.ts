import { useEffect } from 'react';

import { usePermissionsStore, useUserStore } from '@/stores';
import { CreatePermissionRequest, RespondPermissionRequest } from '@/types';
import logger from '@/utils/logger';

export const usePermissions = () => {
  const {
    myPermissions,
    partnerPermissions,
    isLoading,
    error,
    fetchMyPermissions,
    fetchPartnerPermissions,
    createPermission,
    updatePermission,
    respondToPermission,
  } = usePermissionsStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) return;

    // Guard with specific flags (not combined isLoading) to avoid skipping a fetch
    // when only one of the two is already in flight (e.g. the TabLayout pre-fetch).
    const store = usePermissionsStore.getState();
    if (!store.isLoadingMyPermissions) {
      fetchMyPermissions().catch((error) => {
        logger.error('Failed to fetch my permissions in usePermissions hook', error);
      });
    }
    if (!store.isLoadingPartnerPermissions) {
      fetchPartnerPermissions().catch((error) => {
        logger.error('Failed to fetch partner permissions in usePermissions hook', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRequestPermission = async (data: CreatePermissionRequest) => {
    await createPermission(data);
  };

  const handleUpdatePermission = async (
    permissionId: string,
    data: Partial<CreatePermissionRequest>
  ) => {
    await updatePermission(permissionId, data);
  };

  const handleRespondToPermission = async (
    permissionId: string,
    data: RespondPermissionRequest
  ) => {
    await respondToPermission(
      permissionId,
      data.approved,
      data.responseMessage,
      data.pointsCost
    );
  };

  const handleCancelPermission = async (permissionId: string) => {
    await usePermissionsStore.getState().cancelPermission(permissionId);
  };

  const pendingPermissions =
    partnerPermissions?.filter((p) => p.status === 'pending') ?? [];

  return {
    myPermissions,
    partnerPermissions,
    isLoading,
    error,
    pendingCount: pendingPermissions.length,
    pendingPermissions,
    requestPermission: handleRequestPermission,
    updatePermission: handleUpdatePermission,
    respondToPermission: handleRespondToPermission,
    cancelPermission: handleCancelPermission,
    refetch: async () => {
      await Promise.all([fetchMyPermissions(), fetchPartnerPermissions()]);
    },
  };
};
