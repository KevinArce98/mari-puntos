import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Send a push notification to a single device
   */
  async sendNotification(
    pushToken: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data,
    };

    try {
      const ticketChunk = await this.expo.sendPushNotificationsAsync([message]);

      // Check for errors in ticket
      ticketChunk.forEach((ticket) => {
        if (ticket.status === 'error') {
          console.error('❌ Error in push ticket:', ticket.message);
          if (ticket.details?.error) {
            console.error('❌ Error details:', ticket.details.error);
          }
        }
      });
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }

  /**
   * Send push notifications to multiple devices
   */
  async sendNotifications(
    pushTokens: string[],
    payload: PushNotificationPayload
  ): Promise<void> {
    const messages: ExpoPushMessage[] = [];

    for (const pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data,
      });
    }

    if (messages.length === 0) {
      return;
    }

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      console.log('Push notifications sent:', tickets.length);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }

  /**
   * Send notification for new permission request
   */
  async sendPermissionRequestedNotification(
    partnerPushToken: string,
    requesterName: string,
    permissionTitle: string
  ): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: '🔔 Nueva solicitud de permiso',
      body: `${requesterName} solicita permiso: ${permissionTitle}`,
      data: {
        type: 'permission_requested',
      },
    });
  }

  /**
   * Send notification for permission response (approved/rejected)
   */
  async sendPermissionResponseNotification(
    requesterPushToken: string,
    approved: boolean,
    permissionTitle: string
  ): Promise<void> {
    await this.sendNotification(requesterPushToken, {
      title: approved ? '✅ Permiso aprobado' : '❌ Permiso rechazado',
      body: `Tu solicitud "${permissionTitle}" ha sido ${approved ? 'aprobada' : 'rechazada'}`,
      data: {
        type: 'permission_response',
        approved,
      },
    });
  }

  /**
   * Send notification for new action created
   */
  async sendActionCreatedNotification(
    partnerPushToken: string,
    actionCreatorName: string,
    actionTitle: string
  ): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: '⭐ Nueva acción creada',
      body: `${actionCreatorName} ha completado: ${actionTitle}`,
      data: {
        type: 'action_created',
      },
    });
  }

  /**
   * Send notification for action approval
   */
  async sendActionApprovedNotification(
    actionCreatorPushToken: string,
    actionTitle: string,
    pointsAwarded: number
  ): Promise<void> {
    await this.sendNotification(actionCreatorPushToken, {
      title: '🎉 Acción aprobada',
      body: `Tu acción "${actionTitle}" ha sido aprobada. +${pointsAwarded} puntos`,
      data: {
        type: 'action_approved',
        pointsAwarded,
      },
    });
  }

  /**
   * Send notification for action rejection
   */
  async sendActionRejectedNotification(
    actionCreatorPushToken: string,
    actionTitle: string
  ): Promise<void> {
    await this.sendNotification(actionCreatorPushToken, {
      title: '❌ Acción rechazada',
      body: `Tu acción "${actionTitle}" ha sido rechazada`,
      data: {
        type: 'action_rejected',
      },
    });
  }
}
