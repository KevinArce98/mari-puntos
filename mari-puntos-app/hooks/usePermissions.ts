import { usePermissionsStore } from '@/stores';
import { CreatePermissionRequest, RespondPermissionRequest } from '@/types';
import { useEffect } from 'react';

export const usePermissions = () => {
  const {
    myPermissions,
    partnerPermissions,
    isLoading,
    error,
    fetchMyPermissions,
    fetchPartnerPermissions,
    createPermission,
    respondToPermission,
    clearPermissions,
  } = usePermissionsStore();

  useEffect(() => {
    fetchMyPermissions().catch(console.error);
    fetchPartnerPermissions().catch(console.error);
  }, []);

  const handleRequestPermission = async (data: CreatePermissionRequest) => {
    await createPermission(data);
  };

  const handleRespondToPermission = async (
    permissionId: string,
    data: RespondPermissionRequest
  ) => {
    await respondToPermission(permissionId, data.approved, data.responseMessage);
  };

  const handleCancelPermission = async (permissionId: string) => {
    await clearPermissions();
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
    respondToPermission: handleRespondToPermission,
    cancelPermission: handleCancelPermission,
    refetch: () => {
      fetchMyPermissions();
      fetchPartnerPermissions();
    },
  };
};
