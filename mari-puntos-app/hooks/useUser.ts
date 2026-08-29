import { useEffect, useRef } from 'react';

import { useUserStore } from '@/stores';
import logger from '@/utils/logger';

export const useUser = () => {
  const {
    user,
    partnerInfo,
    isLoading,
    error,
    fetchProfile,
    fetchPartnerInfo,
    updateProfile,
    updatePushToken,
    createPartnerLink,
    getPartnerLinkCode,
    joinPartnerLink,
    unlinkPartner,
  } = useUserStore();

  const hasPartnerRef = useRef<boolean>(false);

  useEffect(() => {
    const currentHasPartner = user?.hasPartner ?? false;

    if (currentHasPartner && !partnerInfo && !hasPartnerRef.current) {
      hasPartnerRef.current = true;
      fetchPartnerInfo().catch((error) => {
        logger.error('Failed to fetch partner info in useUser hook', error);
        hasPartnerRef.current = false;
      });
    }

    if (!currentHasPartner) {
      hasPartnerRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.hasPartner, partnerInfo]);

  return {
    user,
    partnerInfo,
    isLoading,
    error,
    hasPartner: !!user?.hasPartner,
    refetch: fetchProfile,
    fetchPartnerInfo,
    updateProfile,
    updatePushToken,
    createPartnerLink,
    getPartnerLinkCode,
    joinPartnerLink,
    unlinkPartner,
  };
};
