import { useState, useEffect, useRef, useCallback } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores';

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
    | 'action_rejected';
  screen?: string;
  approved?: boolean;
  pointsAwarded?: number;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notifications.Notification[]>([]);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const tokenSentRef = useRef(false);
  // Use user state instead of Clerk to avoid auth conflicts
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const handleNotificationResponse = useCallback(
    (data: NotificationData) => {
      if (data.screen) {
        // Navigate to the corresponding screen
        let route: string;
        switch (data.screen) {
          case 'actions':
            route = '/actions';
            break;
          case 'permissions':
            route = '/permissions';
            break;
          case 'rewards':
            route = '/rewards';
            break;
          case 'achievements':
            route = '/achievements';
            break;
          case 'history':
            route = '/history';
            break;
          default:
            console.warn('Unknown screen:', data.screen);
            return;
        }
        router.push(route as any);
      }
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
      console.error('Error sending push token to backend:', error);
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
        console.error('Error registering for push notifications:', error);
      });
  }, []);

  useEffect(() => {
    // Listener para notificaciones recibidas mientras la app está abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(
      async (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      }
    );

    // Listener para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as unknown as NotificationData;
        handleNotificationResponse(data);
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
  }, [handleNotificationResponse]);

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
  alert(errorMessage);
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
