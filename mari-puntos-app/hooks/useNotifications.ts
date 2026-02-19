import { useState, useEffect, useRef, useCallback } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useUserStore } from '@/stores';
import logger from '@/utils/logger';

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
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
  const [notifications, setNotifications] = useState<Notifications.Notification[]>([]);
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

      // Navigate based on notification type
      let route: string;
      switch (data.type) {
        case 'permission_requested':
        case 'permission_response':
          if (!hasPartner) {
            logger.warn('Skipping navigation to /permissions — user has no partner');
            router.push('/');
            return;
          }
          route = '/permissions';
          break;
        case 'action_created':
          if (!hasPartner) {
            logger.warn('Skipping navigation to /actions/review — user has no partner');
            router.push('/');
            return;
          }
          route = '/actions/review';
          break;
        case 'action_approved':
        case 'action_rejected':
          route = '/actions';
          break;
        case 'partner_linked':
          route = '/';
          break;
        default:
          logger.warn('Unknown notification type:', data.type);
          return;
      }

      logger.info('Navigating to:', route);
      router.push(route as any);
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
      async (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      }
    );

    // Listener para cuando el usuario toca una notificación (app en segundo plano o abierta)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as unknown as NotificationData;

        if (data && data.type) {
          logger.info('Notification response received:', data.type);
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
    notifications,
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
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
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
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Las notificaciones push solo funcionan en dispositivos físicos');
  }

  return token;
}
