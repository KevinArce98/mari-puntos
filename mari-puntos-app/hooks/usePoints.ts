import { useEffect } from 'react';
import { useUser } from './useUser';
import { usePointsStore } from '@/stores';
import { GetPointsHistoryParams, GetLeaderboardParams } from '@/types';

export const usePoints = () => {
  const { user, partnerInfo } = useUser();
  const {
    pointsHistory,
    leaderboard,
    isLoading,
    error,
    fetchPointsHistory,
    fetchLeaderboard,
  } = usePointsStore();

  const myPoints = user?.totalPoints || 0;
  const myLevel = user?.currentLevel || 1;
  const myPointsInCurrentLevel = user?.pointsInCurrentLevel || 0;
  
  const partnerPoints = partnerInfo?.partner?.totalPoints || 0;
  const partnerLevel = partnerInfo?.partner?.currentLevel || 1;

  // Calculate points needed for next level (100 points per level)
  const getPointsForNextLevel = (currentLevel: number) => {
    return currentLevel * 100;
  };

  const pointsToNextLevel = getPointsForNextLevel(myLevel) - myPointsInCurrentLevel;
  const progressToNextLevel = (myPointsInCurrentLevel / getPointsForNextLevel(myLevel)) * 100;

  const loadHistory = async (params?: GetPointsHistoryParams) => {
    await fetchPointsHistory(params);
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
    fetchHistory: loadHistory,
    fetchLeaderboard: loadLeaderboard,
  };
};
