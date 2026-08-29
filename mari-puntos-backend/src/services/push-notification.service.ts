import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

import { translate } from '../i18n';
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
      logger.debug({
        message: 'Sending push notification',
        pushToken,
        title: payload.title,
      });

      const ticketChunk = await this.expo.sendPushNotificationsAsync([message]);

      ticketChunk.forEach((ticket) => {
        if (ticket.status === 'error') {
          logger.error({
            message: 'Error in push ticket',
            ticketMessage: ticket.message,
            ticketDetails: ticket.details,
          });
        }
      });

      logger.debug({ message: 'Push notification sent', pushToken });
    } catch (error) {
      logger.error({ err: error, pushToken }, 'Error sending push notification');
    }
  }

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

  async sendPermissionRequestedNotification(
    partnerPushToken: string,
    requesterName: string,
    permissionTitle: string,
    locale?: string | null
  ): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: translate('push.permissionRequestedTitle', locale),
      body: translate('push.permissionRequestedBody', locale, {
        name: requesterName,
        title: permissionTitle,
      }),
      data: {
        type: 'permission_requested',
      },
    });
  }

  async sendPermissionResponseNotification(
    requesterPushToken: string,
    approved: boolean,
    permissionTitle: string,
    locale?: string | null
  ): Promise<void> {
    await this.sendNotification(requesterPushToken, {
      title: translate(
        approved ? 'push.permissionApprovedTitle' : 'push.permissionRejectedTitle',
        locale
      ),
      body: translate(
        approved ? 'push.permissionApprovedBody' : 'push.permissionRejectedBody',
        locale,
        { title: permissionTitle }
      ),
      data: {
        type: 'permission_response',
        approved,
      },
    });
  }

  async sendActionCreatedNotification(
    partnerPushToken: string,
    actionCreatorName: string,
    actionTitle: string,
    locale?: string | null
  ): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: translate('push.actionCreatedTitle', locale),
      body: translate('push.actionCreatedBody', locale, {
        name: actionCreatorName,
        title: actionTitle,
      }),
      data: {
        type: 'action_created',
      },
    });
  }

  async sendActionApprovedNotification(
    actionCreatorPushToken: string,
    actionTitle: string,
    pointsAwarded: number,
    locale?: string | null
  ): Promise<void> {
    await this.sendNotification(actionCreatorPushToken, {
      title: translate('push.actionApprovedTitle', locale),
      body: translate('push.actionApprovedBody', locale, {
        title: actionTitle,
        points: pointsAwarded,
      }),
      data: {
        type: 'action_approved',
        pointsAwarded,
      },
    });
  }

  async sendActionRejectedNotification(
    actionCreatorPushToken: string,
    actionTitle: string,
    locale?: string | null
  ): Promise<void> {
    await this.sendNotification(actionCreatorPushToken, {
      title: translate('push.actionRejectedTitle', locale),
      body: translate('push.actionRejectedBody', locale, { title: actionTitle }),
      data: {
        type: 'action_rejected',
      },
    });
  }

  async sendPartnerLinkedNotification(
    partnerPushToken: string,
    partnerName: string,
    locale?: string | null
  ): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: translate('push.partnerLinkedTitle', locale),
      body: translate('push.partnerLinkedBody', locale, { name: partnerName }),
      data: {
        type: 'partner_linked',
      },
    });
  }

  async sendPartnerUnlinkedNotification(
    partnerPushToken: string,
    locale?: string | null
  ): Promise<void> {
    await this.sendNotification(partnerPushToken, {
      title: translate('push.partnerUnlinkedTitle', locale),
      body: translate('push.partnerUnlinkedBody', locale),
      data: {
        type: 'partner_unlinked',
      },
    });
  }
}
