import { useEffect } from 'react';
import { useUserStore } from '@/stores';

export const useUser = () => {
	const {
		user,
		partnerInfo,
		isLoading,
		error,
		fetchProfile,
		fetchPartnerInfo,
		updateProfile,
		createPartnerLink,
		joinPartnerLink,
	} = useUserStore();

	useEffect(() => {
		if (!user) {
			fetchProfile().catch(console.error);
		}
	}, []);

	useEffect(() => {
		if (user && user.hasPartner && !partnerInfo) {
			fetchPartnerInfo().catch(console.error);
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
		createPartnerLink,
		joinPartnerLink,
	};
};
