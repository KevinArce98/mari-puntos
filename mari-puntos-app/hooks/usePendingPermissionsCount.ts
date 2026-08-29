import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { permissionsService } from '@/services';
import { useUserStore } from '@/stores';
import { PermissionStatus } from '@/types';

export const usePendingPermissionsCount = (scope: 'mine' | 'partner' = 'partner') => {
  const user = useUserStore((s) => s.user);
  const enabled = scope === 'partner' ? (user?.hasPartner ?? false) : !!user;

  const params = { status: PermissionStatus.PENDING, limit: 1 };

  const { data } = useQuery({
    queryKey:
      scope === 'partner'
        ? queryKeys.permissions.partner(params)
        : queryKeys.permissions.mine(params),
    queryFn: () =>
      scope === 'partner'
        ? permissionsService.getPartnerPermissions(params)
        : permissionsService.getMyPermissions(params),
    enabled,
  });

  return data?.pagination.total ?? 0;
};
