import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const FIRST_TIME_KEY = '@mari_puntos_first_time_user';

/**
 * Hook to manage first time user experience
 * Returns whether this is the first time the user opens the app
 */
export function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem(FIRST_TIME_KEY);
      setIsFirstTime(hasSeenWelcome === null);
    } catch (error) {
      console.error('Error checking first time user:', error);
      setIsFirstTime(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsNotFirstTime = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_KEY, 'false');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error marking user as not first time:', error);
    }
  };

  return {
    isFirstTime,
    isLoading,
    markAsNotFirstTime,
  };
}
