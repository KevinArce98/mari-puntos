import { useCallback, useEffect, useRef, useState } from 'react';

import { Platform } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRootNavigationState, useRouter } from 'expo-router';
import type { Href } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useUserStore } from '@/stores';
import logger from '@/utils/logger';

const HANDLED_NOTIFICATION_KEY = '@maripuntos/handled-notification-id';

const NOTIFICATION_ROUTES = {
  permissions: '/(tabs)/permissions' as Href,
  actionsReview: '/actions/review' as Href,
  actions: '/(tabs)/actions' as Href,
  home: '/(tabs)/' as Href,
} as const;

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      // Badge count is managed manually via Notifications.setBadgeCountAsync in
      // NotificationBell — setting this to true would let Expo auto-increment the
      // OS badge from the notification payload (which has no badge field), causing
      // it to diverge from the actual pending count.
      shouldSetBadge: false,
    }) as Notifications.NotificationBehavior,
});

export interface NotificationData {
  type:
    | 'permission_requested'
    | 'permission_response'
    | 'action_created'
    | 'action_approved'
    | 'action_rejected'
    | 'partner_linked';
  approved?: boolean;
  pointsAwarded?: number;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [pendingNotificationData, setPendingNotificationData] =
    useState<NotificationData | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const tokenSentRef = useRef(false);
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const handleNotificationResponse = useCallback(
    (data: NotificationData) => {
      const hasPartner = !!useUserStore.getState().partnerInfo?.id;

      let route: Href;
      switch (data.type) {
        case 'permission_requested':
        case 'permission_response':
          if (!hasPartner) {
            logger.warn('Skipping navigation to permissions — user has no partner');
            router.push(NOTIFICATION_ROUTES.home);
            return;
          }
          route = NOTIFICATION_ROUTES.permissions;
          break;
        case 'action_created':
          if (!hasPartner) {
            logger.warn('Skipping navigation to actions/review — user has no partner');
            router.push(NOTIFICATION_ROUTES.home);
            return;
          }
          route = NOTIFICATION_ROUTES.actionsReview;
          break;
        case 'action_approved':
        case 'action_rejected':
          route = NOTIFICATION_ROUTES.actions;
          break;
        case 'partner_linked':
          route = NOTIFICATION_ROUTES.home;
          break;
        default:
          logger.warn('Unknown notification type:', data.type);
          return;
      }

      logger.info('Navigating to:', route);
      router.push(route);
    },
    [router]
  );

  const sendPushTokenToBackend = useCallback(async (token: string) => {
    if (tokenSentRef.current) return;

    try {
      tokenSentRef.current = true;
      // Use getState() to avoid subscribing to store changes
      await useUserStore.getState().updatePushToken(token);
    } catch (error) {
      tokenSentRef.current = false;
      logger.error('Error sending push token to backend:', error as Error);
    }
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
        }
      })
      .catch((error) => {
        logger.error('Error registering for push notifications:', error as Error);
      });
  }, []);

  useEffect(() => {
    // Listener para notificaciones recibidas mientras la app está abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Badge count is driven by pending items in actionsStore/permissionsStore
      }
    );

    // Listener para cuando el usuario toca una notificación (app en segundo plano o abierta)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as unknown as NotificationData;

        if (data && data.type) {
          logger.info('Notification response received:', data.type);
          // Mark as handled so the cold-start effect doesn't re-navigate on
          // the next reload (getLastNotificationResponseAsync keeps returning it).
          AsyncStorage.setItem(
            HANDLED_NOTIFICATION_KEY,
            response.notification.request.identifier
          ).catch((err) =>
            logger.error('Error marking notification as handled:', err as Error)
          );
          setPendingNotificationData(data);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Handle notification tap from killed state (cold start).
  // addNotificationResponseReceivedListener only fires for background/foreground taps.
  // For killed-state taps, iOS/Android delivers via getLastNotificationResponseAsync on boot.
  useEffect(() => {
    if (!rootNavigationState?.key) return;

    (async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (!response) return;

        const identifier = response.notification.request.identifier;
        const lastHandledId = await AsyncStorage.getItem(HANDLED_NOTIFICATION_KEY);
        if (lastHandledId === identifier) {
          // Already handled on a previous launch — getLastNotificationResponseAsync
          // keeps returning it until the OS clears it, so guard with our own marker.
          return;
        }

        const data = response.notification.request.content
          .data as unknown as NotificationData;
        if (data?.type) {
          logger.info('Cold-start notification tap:', data.type);
          await AsyncStorage.setItem(HANDLED_NOTIFICATION_KEY, identifier);
          setPendingNotificationData(data);
        }
      } catch (err) {
        logger.error('Error reading last notification response:', err as Error);
      }
    })();
    // Run once after navigation is ready (rootNavigationState.key is stable after init)
  }, [rootNavigationState?.key]);

  // Navegar cuando la navegación esté lista y haya una notificación pendiente
  useEffect(() => {
    // Esperar a que la navegación esté completamente inicializada
    if (!rootNavigationState?.key) {
      return;
    }

    if (!pendingNotificationData) {
      return;
    }

    // Pequeño delay para asegurar que la navegación esté completamente lista
    const timeoutId = setTimeout(() => {
      logger.info('Processing pending notification:', pendingNotificationData.type);
      handleNotificationResponse(pendingNotificationData);
      setPendingNotificationData(null);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pendingNotificationData, rootNavigationState?.key, handleNotificationResponse]);

  // Enviar el token cuando el usuario esté autenticado
  useEffect(() => {
    if (user && expoPushToken) {
      sendPushTokenToBackend(expoPushToken);
    }
  }, [user, expoPushToken, sendPushTokenToBackend]);

  return {
    expoPushToken,
  };
}

function handleRegistrationError(errorMessage: string) {
  logger.warn('Push notification registration error:', errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones',
      description: 'Notificaciones de MariPuntos: acciones, permisos y recompensas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#24C6B1',
    });
  }

  const canRegister = Device.isDevice || Platform.OS === 'android';

  if (canRegister) {
    // Type varies across Expo SDK versions — cast to avoid version-specific TS errors
    type PermsResult = { granted?: boolean; status?: string };
    const existingPerms =
      (await Notifications.getPermissionsAsync()) as unknown as PermsResult;
    const isGranted = (p: PermsResult) => p.granted === true || p.status === 'granted';
    let finalGranted = isGranted(existingPerms);

    if (!finalGranted) {
      const requestedPerms =
        (await Notifications.requestPermissionsAsync()) as unknown as PermsResult;
      finalGranted = isGranted(requestedPerms);
    }

    if (!finalGranted) {
      handleRegistrationError(
        'Error: No se concedieron permisos para notificaciones push.'
      );
      return null;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Error: No se encontró el projectId de EAS.');
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (error) {
      logger.error('Error getting push token', error as Error);
    }
  } else {
    logger.info('Push notifications not supported on iOS simulator');
  }

  return token;
}
