import { FindOptionsRelations } from 'typeorm';

import { AppDataSource } from '../config/db';
import { LogType } from '../entities/Log';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import { User } from '../entities/User';
import { translate } from '../i18n';
import { AppError, createError } from '../middlewares/errorMiddleware';
import { generatePartnerCode, getNowUTC6 } from '../utils/helpers';
import { logger } from '../utils/logger';
import { activePartnerLinkWhere } from '../utils/partnerLink';
import { AuditLogService } from './audit-log.service';
import { PushNotificationService } from './push-notification.service';

export class PartnerService {
  private partnerLinkRepository = AppDataSource.getRepository(PartnerLink);
  private userRepository = AppDataSource.getRepository(User);
  private auditLog = new AuditLogService();
  private pushNotificationService = new PushNotificationService();

  async createPartnerLink(userId: string): Promise<PartnerLink> {
    logger.info({ message: 'Creating partner link', userId });

    return await AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const partnerLinkRepo = manager.getRepository(PartnerLink);

      const user = await userRepo.findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        logger.error({ message: 'User not found for partner link creation', userId });
        throw createError.userNotFound();
      }

      const existingActiveLink = await partnerLinkRepo.findOne({
        where: activePartnerLinkWhere(userId),
      });

      if (existingActiveLink) {
        logger.warn({ message: 'User already has an active partner link', userId });
        throw createError.partnerUserAlreadyLinked();
      }

      const existingPendingLink = await partnerLinkRepo.findOne({
        where: [{ user1Id: userId, status: PartnerLinkStatus.PENDING }],
      });

      if (existingPendingLink) {
        logger.info({
          message: 'User already has a pending partner link, returning existing',
          userId,
        });
        return existingPendingLink;
      }

      const linkCode = await this.generateUniqueLinkCode();

      if (!user.partnerCode) {
        user.partnerCode = await this.generateUniquePartnerCode();
        await userRepo.save(user);
      }

      const partnerLink = partnerLinkRepo.create({
        linkCode,
        user1Id: userId,
        status: PartnerLinkStatus.PENDING,
      });

      const saved = await partnerLinkRepo.save(partnerLink);
      logger.info({
        message: 'Partner link created successfully',
        userId,
        partnerLinkId: saved.id,
      });
      return saved;
    });
  }

  async joinPartnerLink(userId: string, linkCode: string): Promise<PartnerLink> {
    logger.info({ message: 'Joining partner link', userId, linkCode });

    const { savedPartnerLink, joiningUser, creatorPushToken, creatorLocale } =
      await AppDataSource.transaction(async (manager) => {
        const userRepo = manager.getRepository(User);
        const partnerLinkRepo = manager.getRepository(PartnerLink);

        const user = await userRepo.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          throw createError.userNotFound();
        }

        const existingActiveLink = await partnerLinkRepo.findOne({
          where: activePartnerLinkWhere(userId),
        });

        if (existingActiveLink) {
          throw createError.partnerUserAlreadyLinked();
        }

        const partnerLink = await partnerLinkRepo.findOne({
          where: { linkCode },
          lock: { mode: 'pessimistic_write' },
        });

        if (!partnerLink) {
          throw createError.partnerLinkNotFound();
        }

        if (partnerLink.user1Id === userId) {
          throw new AppError(
            400,
            'No puedes unirte a tu propio enlace de pareja',
            'errors.partner.cannotJoinOwn'
          );
        }

        if (partnerLink.status !== PartnerLinkStatus.PENDING) {
          throw new AppError(
            400,
            'El enlace de pareja no está disponible',
            'errors.partner.linkNotAvailable'
          );
        }

        if (!partnerLink.user1Id || partnerLink.user2Id) {
          throw new AppError(
            400,
            'Estado de enlace de pareja inválido',
            'errors.partner.invalidLinkStatus'
          );
        }

        const user1 = await userRepo.findOne({ where: { id: partnerLink.user1Id } });
        if (!user1) {
          throw new AppError(
            404,
            'Usuario creador del enlace no encontrado',
            'errors.partner.creatorNotFound'
          );
        }

        partnerLink.user2Id = userId;
        partnerLink.status = PartnerLinkStatus.ACTIVE;
        partnerLink.linkedAt = getNowUTC6();

        if (!user.partnerCode) {
          user.partnerCode = await this.generateUniquePartnerCode();
        }

        await userRepo.save(user);
        const saved = await partnerLinkRepo.save(partnerLink);

        const joinerPendingLinks = await partnerLinkRepo.find({
          where: [{ user1Id: userId, status: PartnerLinkStatus.PENDING }],
        });
        if (joinerPendingLinks.length > 0) {
          await partnerLinkRepo.remove(joinerPendingLinks);
          logger.info({
            message: 'Removed orphaned pending links from joining user',
            userId,
            count: joinerPendingLinks.length,
          });
        }

        await this.auditLog.recordMany(
          [
            {
              userId: saved.user1Id,
              type: LogType.PARTNER_LINKED,
              message: translate('logs.partnerLinked', user1.locale),
              relatedEntityId: saved.id,
              relatedEntityType: 'PartnerLink',
            },
            {
              userId,
              type: LogType.PARTNER_LINKED,
              message: translate('logs.partnerLinked', user.locale),
              relatedEntityId: saved.id,
              relatedEntityType: 'PartnerLink',
            },
          ],
          manager
        );

        return {
          savedPartnerLink: saved,
          joiningUser: user,
          creatorPushToken: user1.pushToken,
          creatorLocale: user1.locale,
        };
      });

    if (creatorPushToken) {
      try {
        await this.pushNotificationService.sendPartnerLinkedNotification(
          creatorPushToken,
          joiningUser.firstName,
          creatorLocale
        );
      } catch (error) {
        logger.error({ message: 'Error sending partner linked notification', error });
      }
    }

    logger.info({
      message: 'Partner link joined successfully',
      userId,
      partnerLinkId: savedPartnerLink.id,
    });
    return savedPartnerLink;
  }

  async getPartnerLinkCode(userId: string): Promise<PartnerLink | null> {
    logger.debug({ message: 'Getting partner link code', userId });
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: { user1Id: userId, status: PartnerLinkStatus.PENDING },
    });
    logger.info({ message: 'Partner link code retrieved', userId, found: !!partnerLink });
    return partnerLink;
  }

  async getPartnerLinkWithDetails(
    userId: string
  ): Promise<{ partnerLink: PartnerLink; partner: User } | null> {
    logger.debug({ message: 'Getting partner link with details', userId });
    const partnerLink = await this.findActiveLink(userId, {
      user1: true,
      user2: true,
    });

    if (!partnerLink) {
      logger.info({ message: 'No active partner link found', userId });
      return null;
    }

    const partner =
      partnerLink.user1Id === userId ? partnerLink.user2 : partnerLink.user1;

    if (!partner) {
      logger.warn({
        message: 'Partner not found in link',
        userId,
        partnerLinkId: partnerLink.id,
      });
      return null;
    }

    logger.info({
      message: 'Partner link with details retrieved',
      userId,
      partnerId: partner.id,
    });
    return { partnerLink, partner };
  }

  async getPartnerId(userId: string): Promise<string | null> {
    logger.debug({ message: 'Getting partner ID', userId });
    const partnerLink = await this.findActiveLink(userId);

    if (!partnerLink) {
      logger.info({ message: 'No active partner link found', userId });
      return null;
    }

    const partnerId =
      partnerLink.user1Id === userId ? partnerLink.user2Id : partnerLink.user1Id;
    logger.info({ message: 'Partner ID retrieved', userId, partnerId });
    return partnerId;
  }

  async getPartnerLink(userId: string): Promise<PartnerLink | null> {
    logger.debug({ message: 'Getting partner link', userId });
    const partnerLink = await this.findActiveLink(userId);

    if (!partnerLink) {
      logger.info({ message: 'No active partner link found', userId });
      return null;
    }

    logger.info({
      message: 'Partner link retrieved',
      userId,
      partnerLinkId: partnerLink.id,
    });
    return partnerLink;
  }

  async unlinkPartner(userId: string): Promise<void> {
    logger.info({ message: 'Unlinking partner', userId });
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (!partnerLink) {
      logger.error({ message: 'Partner link not found for unlinking', userId });
      throw createError.partnerLinkNotFound();
    }

    if (partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      logger.warn({
        message: 'Partner link is not active, cannot unlink',
        userId,
        status: partnerLink.status,
      });
      throw new AppError(
        400,
        'No tienes una pareja vinculada activa',
        'errors.partner.noActiveLink'
      );
    }

    const partnerId =
      partnerLink.user1Id === userId ? partnerLink.user2Id : partnerLink.user1Id;
    const partnerLinkId = partnerLink.id;

    const partner = await this.userRepository.findOne({ where: { id: partnerId } });
    const initiator = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, locale: true },
    });

    await this.partnerLinkRepository.remove(partnerLink);
    logger.info({ message: 'Partner link deleted successfully', userId, partnerLinkId });

    await this.auditLog.recordMany([
      {
        userId,
        type: LogType.PARTNER_UNLINKED,
        message: translate('logs.partnerUnlinked', initiator?.locale),
        relatedEntityId: partnerLinkId,
        relatedEntityType: 'PartnerLink',
      },
      {
        userId: partnerId,
        type: LogType.PARTNER_UNLINKED,
        message: translate('logs.partnerUnlinked', partner?.locale),
        relatedEntityId: partnerLinkId,
        relatedEntityType: 'PartnerLink',
      },
    ]);

    if (partner?.pushToken) {
      try {
        await this.pushNotificationService.sendPartnerUnlinkedNotification(
          partner.pushToken,
          partner.locale
        );
      } catch (error) {
        logger.error({
          message: 'Error sending partner unlinked notification',
          error,
          partnerId,
        });
      }
    }
  }

  private findActiveLink(
    userId: string,
    relations?: FindOptionsRelations<PartnerLink>
  ): Promise<PartnerLink | null> {
    return this.partnerLinkRepository.findOne({
      where: activePartnerLinkWhere(userId),
      ...(relations ? { relations } : {}),
    });
  }

  private async generateUniqueLinkCode(): Promise<string> {
    const MAX_ATTEMPTS = 10;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const code = generatePartnerCode();
      const existingLink = await this.partnerLinkRepository.findOne({
        where: { linkCode: code },
      });
      if (!existingLink) return code;
    }
    throw new AppError(
      500,
      'No se pudo generar un código de enlace único. Intenta de nuevo.',
      'errors.partner.linkCodeGenerationFailed'
    );
  }

  private async generateUniquePartnerCode(): Promise<string> {
    const MAX_ATTEMPTS = 10;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const code = generatePartnerCode();
      const existingUser = await this.userRepository.findOne({
        where: { partnerCode: code },
      });
      if (!existingUser) return code;
    }
    throw new AppError(
      500,
      'No se pudo generar un código de pareja único. Intenta de nuevo.',
      'errors.partner.codeGenerationFailed'
    );
  }
}
