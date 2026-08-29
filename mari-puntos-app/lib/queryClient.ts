import { AppState, type AppStateStatus, Platform } from 'react-native';

import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function setupQueryFocusManager(): () => void {
  focusManager.setEventListener((handleFocus) => {
    const onChange = (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        handleFocus(status === 'active');
      }
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  });

  onlineManager.setOnline(true);

  return () => {};
}
