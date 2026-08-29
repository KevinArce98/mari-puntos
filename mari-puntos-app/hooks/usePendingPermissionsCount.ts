import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { permissionsService } from '@/services';
import { useUserStore } from '@/stores';

export const usePendingPermissionsCount = () => {
  const hasPartner = useUserStore((s) => s.user?.hasPartner ?? false);

  const { data } = useQuery({
    queryKey: queryKeys.permissions.partner(),
    queryFn: async () => (await permissionsService.getPartnerPermissions()).data,
    enabled: hasPartner,
  });

  return (data ?? []).filter((p) => p.status === 'pending').length;
};
