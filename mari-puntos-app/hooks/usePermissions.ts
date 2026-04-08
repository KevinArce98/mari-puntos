import { usePermissionsStore, useUserStore } from '@/stores';
import { CreatePermissionRequest, RespondPermissionRequest } from '@/types';
import { useEffect } from 'react';
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
    clearPermissions,
  } = usePermissionsStore();
  const { user } = useUserStore();

  useEffect(() => {
    // Only fetch permissions if user is loaded (ensures token is available)
    if (!user) return;

    fetchMyPermissions().catch((error) => {
      logger.error('Failed to fetch my permissions in usePermissions hook', error);
    });
    fetchPartnerPermissions().catch((error) => {
      logger.error('Failed to fetch partner permissions in usePermissions hook', error);
    });
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

  return {
    myPermissions,
    partnerPermissions,
    isLoading,
    error,
    pendingCount: (partnerPermissions?.filter((p) => p.status === 'pending') ?? [])
      .length,
    pendingPermissions: partnerPermissions?.filter((p) => p.status === 'pending') ?? [],
    requestPermission: handleRequestPermission,
    updatePermission: handleUpdatePermission,
    respondToPermission: handleRespondToPermission,
    cancelPermission: handleCancelPermission,
    refetch: () => {
      fetchMyPermissions();
      fetchPartnerPermissions();
    },
  };
};
