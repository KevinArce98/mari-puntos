import { AppDataSource } from '../config/db';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { generatePartnerCode, getNowUTC6 } from '../utils/helpers';
import { PushNotificationService } from './push-notification.service';
import { logger } from '../utils/logger';

export class PartnerService {
  private partnerLinkRepository = AppDataSource.getRepository(PartnerLink);
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private pushNotificationService = new PushNotificationService();

  async createPartnerLink(userId: string): Promise<PartnerLink> {
    logger.info({ message: 'Creating partner link', userId });

    return await AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const partnerLinkRepo = manager.getRepository(PartnerLink);

      // Lock user row to serialize concurrent create attempts
      const user = await userRepo.findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        logger.error({ message: 'User not found for partner link creation', userId });
        throw new AppError(404, 'Usuario no encontrado');
      }

      // Block only if user already has an ACTIVE link
      const existingActiveLink = await partnerLinkRepo.findOne({
        where: [
          { user1Id: userId, status: PartnerLinkStatus.ACTIVE },
          { user2Id: userId, status: PartnerLinkStatus.ACTIVE },
        ],
      });

      if (existingActiveLink) {
        logger.warn({ message: 'User already has an active partner link', userId });
        throw new AppError(400, 'El usuario ya tiene un enlace de pareja activo');
      }

      // If user already has a pending link, return it instead of creating a new one
      const existingPendingLink = await partnerLinkRepo.findOne({
        where: [{ user1Id: userId, status: PartnerLinkStatus.PENDING }],
      });

      if (existingPendingLink) {
        logger.info({ message: 'User already has a pending partner link, returning existing', userId });
        return existingPendingLink;
      }

      // Generate unique link code (uses default repo — independent lookup is fine)
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
      logger.info({ message: 'Partner link created successfully', userId, partnerLinkId: saved.id });
      return saved;
    });
  }

  async joinPartnerLink(userId: string, linkCode: string): Promise<PartnerLink> {
    logger.info({ message: 'Joining partner link', userId, linkCode });

    // Execute transaction with pessimistic locks to prevent race conditions
    // where two users could simultaneously join the same link code.
    const { savedPartnerLink, joiningUser, creatorPushToken } = await AppDataSource.transaction(
      async (manager) => {
        const userRepo = manager.getRepository(User);
        const partnerLinkRepo = manager.getRepository(PartnerLink);

        // Lock the joining user row first (by stable order: joining user, then link)
        const user = await userRepo.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          throw new AppError(404, 'Usuario no encontrado');
        }

        // Block only if joining user already has an ACTIVE link
        const existingActiveLink = await partnerLinkRepo.findOne({
          where: [
            { user1Id: userId, status: PartnerLinkStatus.ACTIVE },
            { user2Id: userId, status: PartnerLinkStatus.ACTIVE },
          ],
        });

        if (existingActiveLink) {
          throw new AppError(400, 'El usuario ya tiene un enlace de pareja activo');
        }

        // Lock the partner link row to prevent double-join race
        const partnerLink = await partnerLinkRepo.findOne({
          where: { linkCode },
          lock: { mode: 'pessimistic_write' },
        });

        if (!partnerLink) {
          throw new AppError(404, 'Enlace de pareja no encontrado');
        }

        if (partnerLink.user1Id === userId) {
          throw new AppError(400, 'No puedes unirte a tu propio enlace de pareja');
        }

        if (partnerLink.status !== PartnerLinkStatus.PENDING) {
          throw new AppError(400, 'El enlace de pareja no está disponible');
        }

        if (!partnerLink.user1Id || partnerLink.user2Id) {
          throw new AppError(400, 'Estado de enlace de pareja inválido');
        }

        // Load creator (user1) for notification
        const user1 = await userRepo.findOne({ where: { id: partnerLink.user1Id } });
        if (!user1) {
          throw new AppError(404, 'Usuario creador del enlace no encontrado');
        }

        // Mutate inside the transaction
        partnerLink.user2Id = userId;
        partnerLink.status = PartnerLinkStatus.ACTIVE;
        partnerLink.linkedAt = getNowUTC6();

        if (!user.partnerCode) {
          user.partnerCode = await this.generateUniquePartnerCode();
        }

        await userRepo.save(user);
        const saved = await partnerLinkRepo.save(partnerLink);

        // Clean up any orphaned PENDING links from the joining user
        const joinerPendingLinks = await partnerLinkRepo.find({
          where: [{ user1Id: userId, status: PartnerLinkStatus.PENDING }],
        });
        if (joinerPendingLinks.length > 0) {
          await partnerLinkRepo.remove(joinerPendingLinks);
          logger.info({ message: 'Removed orphaned pending links from joining user', userId, count: joinerPendingLinks.length });
        }

        // Create link logs for both users in the same transaction
        const logRepo = manager.getRepository(Log);
        await logRepo.save([
          logRepo.create({
            userId: saved.user1Id,
            type: LogType.PARTNER_LINKED,
            message: 'Vinculado exitosamente con pareja',
            relatedEntityId: saved.id,
            relatedEntityType: 'PartnerLink',
          }),
          logRepo.create({
            userId,
            type: LogType.PARTNER_LINKED,
            message: 'Vinculado exitosamente con pareja',
            relatedEntityId: saved.id,
            relatedEntityType: 'PartnerLink',
          }),
        ]);

        return {
          savedPartnerLink: saved,
          joiningUser: user,
          creatorPushToken: user1.pushToken,
        };
      }
    );

    // Fire-and-forget notification (outside transaction)
    if (creatorPushToken) {
      try {
        await this.pushNotificationService.sendPartnerLinkedNotification(
          creatorPushToken,
          joiningUser.firstName
        );
      } catch (error) {
        logger.error({ message: 'Error sending partner linked notification', error });
      }
    }

    logger.info({ message: 'Partner link joined successfully', userId, partnerLinkId: savedPartnerLink.id });
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

  /**
   * Get partner link with partner details
   * Returns structure matching controller expectations
   * Returns null if no active partner link exists
   */
  async getPartnerLinkWithDetails(
    userId: string
  ): Promise<{ partnerLink: PartnerLink; partner: User } | null> {
    logger.debug({ message: 'Getting partner link with details', userId });
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2'],
    });

    if (!partnerLink) {
      logger.info({ message: 'No partner link found', userId });
      return null;
    }

    // Only return partner info if link is active
    if (partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      logger.info({ message: 'Partner link not active', userId, status: partnerLink.status });
      return null;
    }

    const partner =
      partnerLink.user1Id === userId ? partnerLink.user2 : partnerLink.user1;

    if (!partner) {
      logger.warn({ message: 'Partner not found in link', userId, partnerLinkId: partnerLink.id });
      return null;
    }

    logger.info({ message: 'Partner link with details retrieved', userId, partnerId: partner.id });
    return { partnerLink, partner };
  }

  async getPartnerId(userId: string): Promise<string | null> {
    logger.debug({ message: 'Getting partner ID', userId });
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (!partnerLink || partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      logger.info({ message: 'No active partner link found', userId });
      return null;
    }

    const partnerId = partnerLink.user1Id === userId ? partnerLink.user2Id : partnerLink.user1Id;
    logger.info({ message: 'Partner ID retrieved', userId, partnerId });
    return partnerId;
  }

  async getPartnerLink(userId: string): Promise<PartnerLink | null> {
    logger.debug({ message: 'Getting partner link', userId });
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (!partnerLink || partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      logger.info({ message: 'No active partner link found', userId });
      return null;
    }

    logger.info({ message: 'Partner link retrieved', userId, partnerLinkId: partnerLink.id });
    return partnerLink;
  }

  async unlinkPartner(userId: string): Promise<void> {
    logger.info({ message: 'Unlinking partner', userId });
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (!partnerLink) {
      logger.error({ message: 'Partner link not found for unlinking', userId });
      throw new AppError(404, 'Enlace de pareja no encontrado');
    }

    if (partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      logger.warn({ message: 'Partner link is not active, cannot unlink', userId, status: partnerLink.status });
      throw new AppError(400, 'No tienes una pareja vinculada activa');
    }

    const partnerId =
      partnerLink.user1Id === userId ? partnerLink.user2Id : partnerLink.user1Id;
    const partnerLinkId = partnerLink.id;

    // Get the partner's push token for notification
    const partner = await this.userRepository.findOne({ where: { id: partnerId } });

    // Delete the partner link — both users remain with their partnerCode intact
    await this.partnerLinkRepository.remove(partnerLink);
    logger.info({ message: 'Partner link deleted successfully', userId, partnerLinkId });

    // Create unlink logs for both users
    await this.logRepository.save([
      this.logRepository.create({
        userId,
        type: LogType.PARTNER_UNLINKED,
        message: 'Desvinculado de pareja',
        relatedEntityId: partnerLinkId,
        relatedEntityType: 'PartnerLink',
      }),
      this.logRepository.create({
        userId: partnerId,
        type: LogType.PARTNER_UNLINKED,
        message: 'Desvinculado de pareja',
        relatedEntityId: partnerLinkId,
        relatedEntityType: 'PartnerLink',
      }),
    ]);

    // Notify the other partner
    if (partner?.pushToken) {
      try {
        await this.pushNotificationService.sendPartnerUnlinkedNotification(partner.pushToken);
      } catch (error) {
        logger.error({ message: 'Error sending partner unlinked notification', error, partnerId });
        // Don't fail the unlink process if notification fails
      }
    }
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
    throw new AppError(500, 'No se pudo generar un código de enlace único. Intenta de nuevo.');
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
    throw new AppError(500, 'No se pudo generar un código de pareja único. Intenta de nuevo.');
  }
}
