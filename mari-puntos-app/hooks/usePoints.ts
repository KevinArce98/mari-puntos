import { useMemo } from 'react';

import { usePointsStore } from '@/stores';
import { GetPointsHistoryParams } from '@/types';

import { useUser } from './useUser';

export const usePoints = () => {
  const { user, partnerInfo } = useUser();
  const { pointsHistory, isLoading, error, paginationMeta, fetchPointsHistory } =
    usePointsStore();

  const myPoints = user?.totalPoints || 0;
  const myLevel = user?.currentLevel || 1;
  const myPointsInCurrentLevel = user?.pointsInCurrentLevel || 0;

  const partnerPoints = partnerInfo?.partner?.totalPoints || 0;
  const partnerLevel = partnerInfo?.partner?.currentLevel || 1;

  const getPointsForNextLevel = (currentLevel: number) => currentLevel * 100;

  const pointsToNextLevel = useMemo(
    () => getPointsForNextLevel(myLevel) - myPointsInCurrentLevel,
    [myLevel, myPointsInCurrentLevel]
  );
  const progressToNextLevel = useMemo(
    () => (myPointsInCurrentLevel / getPointsForNextLevel(myLevel)) * 100,
    [myLevel, myPointsInCurrentLevel]
  );

  const loadHistory = async (params?: GetPointsHistoryParams, append = false) => {
    await fetchPointsHistory(params, append);
  };

  return {
    myPoints,
    partnerPoints,
    myLevel,
    partnerLevel,
    pointsToNextLevel,
    progressToNextLevel,
    pointsHistory,
    isLoading,
    error,
    paginationMeta,
    fetchHistory: loadHistory,
  };
};
