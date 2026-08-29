import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { streakService } from '@/services/streakService';
import { useUserStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorMessage';

export const useStreak = () => {
  const hasPartner = useUserStore((s) => s.user?.hasPartner ?? false);

  const query = useQuery({
    queryKey: queryKeys.streak.current(),
    queryFn: () => streakService.getStreak(),
    enabled: hasPartner,
  });

  return {
    streak: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error) : null,
    refetch: async () => {
      await query.refetch();
    },
  };
};
