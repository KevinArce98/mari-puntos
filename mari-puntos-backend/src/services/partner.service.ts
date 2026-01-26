import { AppDataSource } from '../config/db';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { generatePartnerCode } from '../utils/helpers';

export class PartnerService {
  private partnerLinkRepository = AppDataSource.getRepository(PartnerLink);
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);

  async createPartnerLink(userId: string): Promise<PartnerLink> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Check if user already has a partner link
    const existingLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (existingLink) {
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

    return partnerLink;
  }

  async joinPartnerLink(userId: string, linkCode: string): Promise<PartnerLink> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Check if user already has a partner link
    const existingLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (existingLink) {
      throw new AppError(400, 'El usuario ya tiene un enlace de pareja');
    }

    // Find partner link by code
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: { linkCode },
      relations: ['user1', 'user2'],
    });

    if (!partnerLink) {
      throw new AppError(404, 'Enlace de pareja no encontrado');
    }

    // Validate that user is not trying to join their own link
    if (partnerLink.user1Id === userId) {
      throw new AppError(400, 'No puedes unirte a tu propio enlace de pareja');
    }

    if (partnerLink.status !== PartnerLinkStatus.PENDING) {
      throw new AppError(400, 'El enlace de pareja no está disponible');
    }

    // Add user as second partner
    if (partnerLink.user1Id && !partnerLink.user2Id) {
      partnerLink.user2Id = userId;
    } else {
      throw new AppError(400, 'Estado de enlace de pareja inválido');
    }

    // Generate partner code if not exists
    if (!user.partnerCode) {
      user.partnerCode = await this.generateUniquePartnerCode();
    }

    partnerLink.status = PartnerLinkStatus.ACTIVE;
    partnerLink.linkedAt = new Date();

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

    return savedPartnerLink;
  }

  async getPartnerLinkCode(userId: string): Promise<PartnerLink | null> {
    let partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }],
    });
    return partnerLink;
  }

  /**
   * Get partner link with partner details
   * Returns structure matching controller expectations
   * Returns null if no active partner link exists
   */
  async getPartnerLink(
    userId: string
  ): Promise<{ partnerLink: PartnerLink; partner: User } | null> {
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2'],
    });

    if (!partnerLink) {
      return null;
    }

    // Only return partner info if link is active
    if (partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      return null;
    }

    const partner =
      partnerLink.user1Id === userId ? partnerLink.user2 : partnerLink.user1;

    if (!partner) {
      return null;
    }

    return { partnerLink, partner };
  }

  async getPartnerId(userId: string): Promise<string | null> {
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (!partnerLink || partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      return null;
    }

    return partnerLink.user1Id === userId ? partnerLink.user2Id : partnerLink.user1Id;
  }

  async unlinkPartner(userId: string): Promise<void> {
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (!partnerLink) {
      throw new AppError(404, 'Enlace de pareja no encontrado');
    }

    partnerLink.status = PartnerLinkStatus.INACTIVE;
    await this.partnerLinkRepository.save(partnerLink);
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
