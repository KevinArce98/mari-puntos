import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { actionsService } from '@/services';
import { useUserStore } from '@/stores';
import { ActionStatus } from '@/types';

export const usePendingActionsCount = () => {
  const hasPartner = useUserStore((s) => s.user?.hasPartner ?? false);

  const { data } = useQuery({
    queryKey: queryKeys.actions.partner({ status: ActionStatus.PENDING, limit: 1 }),
    queryFn: () =>
      actionsService.getPartnerActions({ status: ActionStatus.PENDING, limit: 1 }),
    enabled: hasPartner,
  });

  return data?.pagination.total ?? 0;
};
