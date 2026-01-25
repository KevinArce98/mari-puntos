import { AppDataSource } from '../config/db';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import { User, UserRole } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { generatePartnerCode } from '../utils/helpers';

export class PartnerService {
  private partnerLinkRepository = AppDataSource.getRepository(PartnerLink);
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);

  async createPartnerLink(userId: string, role: string): Promise<PartnerLink> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check if user already has a partner link
    const existingLink = await this.partnerLinkRepository.findOne({
      where: [
        { husbandId: userId },
        { wifeId: userId },
      ],
    });

    if (existingLink) {
      throw new AppError(400, 'User already has a partner link');
    }

    // Update user role
    user.role = role as UserRole;

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
      husbandId: role === UserRole.HUSBAND ? userId : undefined,
      wifeId: role === UserRole.WIFE ? userId : undefined,
      status: PartnerLinkStatus.PENDING,
    });

    await this.partnerLinkRepository.save(partnerLink);

    return partnerLink;
  }

  async joinPartnerLink(userId: string, linkCode: string): Promise<PartnerLink> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check if user already has a partner link
    const existingLink = await this.partnerLinkRepository.findOne({
      where: [
        { husbandId: userId },
        { wifeId: userId },
      ],
    });

    if (existingLink) {
      throw new AppError(400, 'User already has a partner link');
    }

    // Find partner link by code
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: { linkCode },
      relations: ['husband', 'wife'],
    });

    if (!partnerLink) {
      throw new AppError(404, 'Partner link not found');
    }

    if (partnerLink.status !== PartnerLinkStatus.PENDING) {
      throw new AppError(400, 'Partner link is not available');
    }

    // Determine role and update link
    let husbandId: string;
    let wifeId: string;

    if (partnerLink.husbandId && !partnerLink.wifeId) {
      user.role = UserRole.WIFE;
      partnerLink.wifeId = userId;
      husbandId = partnerLink.husbandId;
      wifeId = userId;
    } else if (partnerLink.wifeId && !partnerLink.husbandId) {
      user.role = UserRole.HUSBAND;
      partnerLink.husbandId = userId;
      husbandId = userId;
      wifeId = partnerLink.wifeId;
    } else {
      throw new AppError(400, 'Invalid partner link state');
    }

    // Generate partner code if not exists
    if (!user.partnerCode) {
      user.partnerCode = await this.generateUniquePartnerCode();
    }

    partnerLink.status = PartnerLinkStatus.ACTIVE;
    partnerLink.linkedAt = new Date();

    await this.userRepository.save(user);
    const savedPartnerLink = await this.partnerLinkRepository.save(partnerLink);

    // Create logs for both users
    await this.logRepository.save([
      this.logRepository.create({
        userId: husbandId,
        type: LogType.PARTNER_LINKED,
        message: 'Successfully linked with partner',
        relatedEntityId: savedPartnerLink.id,
        relatedEntityType: 'PartnerLink',
      }),
      this.logRepository.create({
        userId: wifeId,
        type: LogType.PARTNER_LINKED,
        message: 'Successfully linked with partner',
        relatedEntityId: savedPartnerLink.id,
        relatedEntityType: 'PartnerLink',
      }),
    ]);

    return savedPartnerLink;
  }

  /**
   * Get partner link with partner details
   * Returns structure matching controller expectations
   */
  async getPartnerLink(userId: string): Promise<{ partnerLink: PartnerLink; partner: User }> {
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [
        { husbandId: userId },
        { wifeId: userId },
      ],
      relations: ['husband', 'wife'],
    });

    if (!partnerLink) {
      throw new AppError(404, 'Partner link not found');
    }

    const partner =
      partnerLink.husbandId === userId ? partnerLink.wife : partnerLink.husband;

    if (!partner) {
      throw new AppError(404, 'Partner not found');
    }

    return { partnerLink, partner };
  }

  async getPartnerId(userId: string): Promise<string | null> {
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [
        { husbandId: userId },
        { wifeId: userId },
      ],
    });

    if (!partnerLink || partnerLink.status !== PartnerLinkStatus.ACTIVE) {
      return null;
    }

    return partnerLink.husbandId === userId
      ? partnerLink.wifeId
      : partnerLink.husbandId;
  }

  async unlinkPartner(userId: string): Promise<void> {
    const partnerLink = await this.partnerLinkRepository.findOne({
      where: [
        { husbandId: userId },
        { wifeId: userId },
      ],
    });

    if (!partnerLink) {
      throw new AppError(404, 'Partner link not found');
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
