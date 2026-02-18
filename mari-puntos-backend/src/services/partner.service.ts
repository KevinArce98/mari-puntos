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

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.error({ message: 'User not found for partner link creation', userId });
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Check if user already has a partner link
    const existingLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (existingLink && existingLink.status !== PartnerLinkStatus.INACTIVE) {
      logger.warn({ message: 'User already has an active or pending partner link', userId });
      throw new AppError(400, 'El usuario ya tiene un enlace de pareja');
    }

    // Generate unique link code
    const linkCode = await this.generateUniqueLinkCode();

    // Generate partner code if not exists
    if (!user.partnerCode) {
      user.partnerCode = await this.generateUniquePartnerCode();
    }

    await this.userRepository.save(user);

    // Create partner link
    const partnerLink = this.partnerLinkRepository.create({
      linkCode,
      user1Id: userId,
      status: PartnerLinkStatus.PENDING,
    });

    await this.partnerLinkRepository.save(partnerLink);
    logger.info({ message: 'Partner link created successfully', userId, partnerLinkId: partnerLink.id });

    return partnerLink;
  }

  async joinPartnerLink(userId: string, linkCode: string): Promise<PartnerLink> {
    logger.info({ message: 'Joining partner link', userId, linkCode });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.error({ message: 'User not found for joining partner link', userId });
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Check if user already has an active or pending partner link
    const existingLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (existingLink && existingLink.status !== PartnerLinkStatus.INACTIVE) {
      logger.warn({ message: 'User already has an active or pending partner link', userId });
      throw new AppError(400, 'El usuario ya tiene un enlace de pareja');
    }

    // Find partner link by code
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: { linkCode },
      relations: ['user1', 'user2'],
    });

    if (!partnerLink) {
      logger.warn({ message: 'Partner link not found', linkCode });
      throw new AppError(404, 'Enlace de pareja no encontrado');
    }

    // Get user1 with pushToken
    const user1 = await this.userRepository.findOne({
      where: { id: partnerLink.user1Id },
    });

    if (!user1) {
      logger.error({ message: 'Creator user not found for partner link', partnerLinkId: partnerLink.id });
      throw new AppError(404, 'Usuario creador del enlace no encontrado');
    }

    // Validate that user is not trying to join their own link
    if (partnerLink.user1Id === userId) {
      logger.warn({ message: 'User trying to join own partner link', userId, linkCode });
      throw new AppError(400, 'No puedes unirte a tu propio enlace de pareja');
    }

    if (partnerLink.status !== PartnerLinkStatus.PENDING) {
      logger.warn({ message: 'Partner link not available', linkCode, status: partnerLink.status });
      throw new AppError(400, 'El enlace de pareja no está disponible');
    }

    // Add user as second partner
    if (partnerLink.user1Id && !partnerLink.user2Id) {
      partnerLink.user2Id = userId;
    } else {
      logger.error({ message: 'Invalid partner link state', partnerLinkId: partnerLink.id });
      throw new AppError(400, 'Estado de enlace de pareja inválido');
    }

    // Generate partner code if not exists
    if (!user.partnerCode) {
      user.partnerCode = await this.generateUniquePartnerCode();
    }

    partnerLink.status = PartnerLinkStatus.ACTIVE;
    partnerLink.linkedAt = getNowUTC6();

    await this.userRepository.save(user);
    const savedPartnerLink = await this.partnerLinkRepository.save(partnerLink);
    console.log({ user1Id: savedPartnerLink.user1Id, user2Id: partnerLink.user2Id });

    // Create logs for both users
    await this.logRepository.save([
      this.logRepository.create({
        userId: savedPartnerLink.user1Id,
        type: LogType.PARTNER_LINKED,
        message: 'Vinculado exitosamente con pareja',
        relatedEntityId: savedPartnerLink.id,
        relatedEntityType: 'PartnerLink',
      }),
      this.logRepository.create({
        userId,
        type: LogType.PARTNER_LINKED,
        message: 'Vinculado exitosamente con pareja',
        relatedEntityId: savedPartnerLink.id,
        relatedEntityType: 'PartnerLink',
      }),
    ]);

    // Send notification to the partner who created the link
    if (user1.pushToken) {
      try {
        await this.pushNotificationService.sendPartnerLinkedNotification(
          user1.pushToken,
          user.firstName
        );
      } catch (error) {
        logger.error({ message: 'Error sending partner linked notification', error, userId: user1.id });
        // Don't fail the linking process if notification fails
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

    partnerLink.status = PartnerLinkStatus.INACTIVE;
    await this.partnerLinkRepository.save(partnerLink);
    logger.info({ message: 'Partner unlinked successfully', userId, partnerLinkId: partnerLink.id });
  }

  private async generateUniqueLinkCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = generatePartnerCode();
      const existingLink = await this.partnerLinkRepository.findOne({
        where: { linkCode: code },
      });
      exists = !!existingLink;
    }

    return code!;
  }

  private async generateUniquePartnerCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = generatePartnerCode();
      const existingUser = await this.userRepository.findOne({
        where: { partnerCode: code },
      });
      exists = !!existingUser;
    }

    return code!;
  }
}
