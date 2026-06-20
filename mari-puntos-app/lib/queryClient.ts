import { AppState, type AppStateStatus, Platform } from 'react-native';

import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';

/**
 * Singleton QueryClient.
 *
 * Exported as a module-scoped instance (not just provided via context) so that
 * non-React code — e.g. push-notification listeners and the API 401 handler —
 * can invalidate/clear cached queries imperatively.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30s — avoids the redundant refetch-on-every-focus
      // pattern the old stores had, while still keeping screens reasonably current.
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

/**
 * Wire React Query's focus manager to React Native's AppState so
 * `refetchOnWindowFocus` works (RN has no window focus event).
 * Call once at app startup.
 */
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

  // We don't have NetInfo wired; assume online. React Query will still surface
  // request failures through query error state.
  onlineManager.setOnline(true);

  return () => {};
}
