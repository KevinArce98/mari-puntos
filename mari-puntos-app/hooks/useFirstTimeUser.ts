import { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import logger from '@/utils/logger';

const FIRST_TIME_KEY = '@mari_puntos_first_time_user';

export function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem(FIRST_TIME_KEY);
      const isFirst = hasSeenWelcome === null;
      setIsFirstTime(isFirst);
      if (isFirst) logger.info('First-time user detected');
    } catch (error) {
      logger.error('Error checking first time user', error as Error);
      setIsFirstTime(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsNotFirstTime = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_KEY, 'false');
      setIsFirstTime(false);
      logger.info('First-time welcome dismissed');
    } catch (error) {
      logger.error('Error marking user as not first time', error as Error);
    }
  };

  return {
    isFirstTime,
    isLoading,
    markAsNotFirstTime,
  };
}
