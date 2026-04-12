import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { logger } from '../utils/logger';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
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
      logger.warn({ message: 'Invalid Expo push token', pushToken });
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
      logger.debug({ message: 'Sending push notification', pushToken, title: payload.title });

      const ticketChunk = await this.expo.sendPushNotificationsAsync([message]);

      // Check for errors in ticket
      ticketChunk.forEach((ticket) => {
        if (ticket.status === 'error') {
          logger.error({ message: 'Error in push ticket', ticketMessage: ticket.message, ticketDetails: ticket.details });
        }
      });

      logger.debug({ message: 'Push notification sent', pushToken });
    } catch (error) {
      logger.error({ err: error, pushToken }, 'Error sending push notification');
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
        logger.warn({ pushToken }, 'Invalid Expo push token, skipping');
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
          logger.error({ err: error }, 'Error sending push notification chunk');
        }
      }

      logger.info({ count: tickets.length }, 'Push notifications sent');
    } catch (error) {
      logger.error({ err: error }, 'Error sending push notifications');
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

  /**
   * Send notification for partner linked
   */
  async sendPartnerLinkedNotification(
    partnerPushToken: string,
    partnerName: string
  ): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: '💕 ¡Pareja conectada!',
      body: `${partnerName} se ha conectado contigo. ¡Ya pueden comenzar su viaje juntos!`,
      data: {
        type: 'partner_linked',
      },
    });
  }

  /**
   * Send notification for partner unlinked
   */
  async sendPartnerUnlinkedNotification(partnerPushToken: string): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: '💔 Pareja desvinculada',
      body: 'Tu pareja ha desvinculado la cuenta. Puedes volverte a vincular con otro código.',
      data: {
        type: 'partner_unlinked',
      },
    });
  }
}
