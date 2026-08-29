import { useMemo } from 'react';

import { useUser } from './useUser';

const getPointsForNextLevel = (currentLevel: number) => currentLevel * 100;

export const usePoints = () => {
  const { user, partnerInfo } = useUser();

  const myPoints = user?.totalPoints || 0;
  const myLevel = user?.currentLevel || 1;
  const myPointsInCurrentLevel = user?.pointsInCurrentLevel || 0;

  const partnerPoints = partnerInfo?.partner?.totalPoints || 0;
  const partnerLevel = partnerInfo?.partner?.currentLevel || 1;

  const pointsToNextLevel = useMemo(
    () => getPointsForNextLevel(myLevel) - myPointsInCurrentLevel,
    [myLevel, myPointsInCurrentLevel]
  );
  const progressToNextLevel = useMemo(
    () => (myPointsInCurrentLevel / getPointsForNextLevel(myLevel)) * 100,
    [myLevel, myPointsInCurrentLevel]
  );

  return {
    myPoints,
    partnerPoints,
    myLevel,
    partnerLevel,
    pointsToNextLevel,
    progressToNextLevel,
  };
};
