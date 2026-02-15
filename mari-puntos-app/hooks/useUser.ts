import { useEffect } from 'react';
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

  useEffect(() => {
    if (!user) {
      fetchProfile().catch((error) => {
        logger.error('Failed to fetch profile in useUser hook', error);
      });
    }
  }, []);

  useEffect(() => {
    if (user && user.hasPartner && !partnerInfo) {
      fetchPartnerInfo().catch((error) => {
        logger.error('Failed to fetch partner info in useUser hook', error);
      });
    }
  }, [user]);

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
