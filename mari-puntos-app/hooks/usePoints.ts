import { useMemo } from 'react';

import { usePointsStore } from '@/stores';
import { GetLeaderboardParams, GetPointsHistoryParams } from '@/types';

import { useUser } from './useUser';

export const usePoints = () => {
  const { user, partnerInfo } = useUser();
  const {
    pointsHistory,
    leaderboard,
    isLoading,
    error,
    paginationMeta,
    fetchPointsHistory,
    fetchLeaderboard,
  } = usePointsStore();

  const myPoints = user?.totalPoints || 0;
  const myLevel = user?.currentLevel || 1;
  const myPointsInCurrentLevel = user?.pointsInCurrentLevel || 0;

  const partnerPoints = partnerInfo?.partner?.totalPoints || 0;
  const partnerLevel = partnerInfo?.partner?.currentLevel || 1;

  // Calculate points needed for next level (100 points per level)
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

  const loadLeaderboard = async (params?: GetLeaderboardParams) => {
    await fetchLeaderboard(params);
  };

  return {
    myPoints,
    partnerPoints,
    myLevel,
    partnerLevel,
    pointsToNextLevel,
    progressToNextLevel,
    pointsHistory,
    leaderboard,
    isLoading,
    error,
    paginationMeta,
    fetchHistory: loadHistory,
    fetchLeaderboard: loadLeaderboard,
  };
};
