import { AppDataSource } from '../config/db';
import { Achievement } from '../entities/Achievement';
import { PartnerLinkStatus } from '../entities/PartnerLink';
import { User } from '../entities/User';
import { AppError } from '../middlewares/errorMiddleware';
import { generatePartnerCode } from '../utils/helpers';
import { logger } from '../utils/logger';
import { CreateUserInput, UpdateUserInput } from '../validators/schemas';

export class UsersService {
  private userRepository = AppDataSource.getRepository(User);

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['partnerLinkAsUser1', 'partnerLinkAsUser2'],
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    return user;
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { clerkId },
      relations: ['partnerLinkAsUser1', 'partnerLinkAsUser2'],
    });
  }

  /**
   * Create a new user
   */
  async createUser(clerkId: string, data: CreateUserInput): Promise<User> {
    logger.info({ message: 'Creating user with clerkId', clerkId });

    // Check if user already exists with this clerkId
    const existingUser = await this.userRepository.findOne({
      where: { clerkId },
    });

    if (existingUser) {
      logger.warn({ message: 'User already exists with clerkId', clerkId });
      throw new AppError(409, 'El usuario ya existe');
    }

    // Check if email is already in use
    const emailInUse = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (emailInUse) {
      logger.warn({ message: 'Email already in use', email: data.email });
      throw new AppError(409, 'El correo electrónico ya está en uso');
    }

    // Fetch user from Clerk to get the imageUrl
    let avatarUrl: string | undefined = data.avatarUrl;
    try {
      const { clerkClient } = await import('../config/clerk');
      const clerkUser = await clerkClient.users.getUser(clerkId);
      if (clerkUser.imageUrl) {
        avatarUrl = clerkUser.imageUrl;
        logger.debug({ message: 'Fetched avatar URL from Clerk', avatarUrl });
      }
    } catch (clerkError) {
      logger.warn(
        { err: clerkError },
        'Failed to fetch avatar from Clerk, using provided avatarUrl'
      );
    }

    const user = this.userRepository.create({
      clerkId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl,
    });

    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (dbError) {
      // Unique constraint violation — two concurrent requests raced; treat as duplicate
      if (dbError instanceof Error && 'code' in dbError && dbError.code === '23505') {
        throw new AppError(409, 'El usuario ya existe');
      }
      throw dbError;
    }
    logger.info({ message: 'User created successfully with id', userId: savedUser.id });

    return savedUser;
  }

  async findOrCreateByClerkId(clerkId: string): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { clerkId } });
    if (existing) return existing;

    const { clerkClient } = await import('../config/clerk');
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new AppError(500, 'El usuario de Clerk no tiene un correo electrónico asociado');
    }

    const staleByEmail = await this.userRepository.findOne({ where: { email } });
    if (staleByEmail) {
      logger.warn(
        { clerkId, previousClerkId: staleByEmail.clerkId, email },
        'Re-linking existing user row to new clerkId (stale row from incomplete deletion?)'
      );
      staleByEmail.clerkId = clerkId;
      return await this.userRepository.save(staleByEmail);
    }

    const user = this.userRepository.create({
      clerkId,
      email,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      avatarUrl: clerkUser.imageUrl,
    });

    try {
      return await this.userRepository.save(user);
    } catch (dbError) {
      if (dbError instanceof Error && 'code' in dbError && dbError.code === '23505') {
        // Raced with a concurrent request (another API call or the webhook) — re-fetch.
        const winner = await this.userRepository.findOne({ where: { clerkId } });
        if (winner) return winner;
        const winnerByEmail = await this.userRepository.findOne({ where: { email } });
        if (winnerByEmail) return winnerByEmail;
      }
      throw dbError;
    }
  }


  async updateUser(
    userId: string,
    data: UpdateUserInput
  ): Promise<{ user: User; hasPartner: boolean }> {
    logger.debug({ message: 'Updating user', userId });

    const user = await this.getUserById(userId);

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.pushToken !== undefined) user.pushToken = data.pushToken;

    await this.userRepository.save(user);

    if (
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.profileImage !== undefined
    ) {
      try {
        const { clerkClient } = await import('../config/clerk');

        if (data.profileImage) {
          logger.debug({ message: 'Updating profile image in Clerk', userId });

          // Convert base64 to Blob for Clerk API
          const base64Data = data.profileImage.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer], { type: 'image/jpeg' });

          await clerkClient.users.updateUserProfileImage(user.clerkId, {
            file: blob as File,
          });
        }

        if (data.firstName !== undefined || data.lastName !== undefined) {
          logger.debug({ message: 'Updating user name in Clerk', userId });
          await clerkClient.users.updateUser(user.clerkId, {
            firstName: data.firstName,
            lastName: data.lastName,
          });
        }

        logger.info({ message: 'Clerk profile updated successfully', userId });

        // Fetch updated user from Clerk to get the new imageUrl
        const clerkUser = await clerkClient.users.getUser(user.clerkId);
        if (clerkUser.imageUrl && clerkUser.imageUrl !== user.avatarUrl) {
          user.avatarUrl = clerkUser.imageUrl;
          await this.userRepository.save(user);
          logger.debug({
            message: 'Synced avatar URL from Clerk',
            avatarUrl: clerkUser.imageUrl,
          });
        }
      } catch (clerkError) {
        logger.error(
          { err: clerkError, userId },
          'Failed to sync profile to Clerk — local update already saved, continuing'
        );
      }
    }

    const hasPartner = this.checkHasPartner(user);

    logger.debug({ message: 'User updated successfully', userId });

    return { user, hasPartner };
  }

  /**
   * Get user profile with hasPartner flag
   */
  async getUserProfile(userId: string): Promise<{ user: User; hasPartner: boolean }> {
    const user = await this.getUserById(userId);
    const hasPartner = this.checkHasPartner(user);

    return { user, hasPartner };
  }

  /**
   * Check if user has an active partner link
   */
  private checkHasPartner(user: User): boolean {
    const partnerLink = user.partnerLinkAsUser1 || user.partnerLinkAsUser2;
    return !!partnerLink && partnerLink.status === PartnerLinkStatus.ACTIVE;
  }

  async getUserStats(userId: string): Promise<{
    totalPoints: number;
    currentLevel: number;
    pointsInCurrentLevel: number;
    actionsCreated: number;
    actionsApproved: number;
    permissionsRequested: number;
    achievementsUnlocked: number;
  }> {
    const user = await this.getUserById(userId);

    // Parallel queries — all fire simultaneously on a single connection slot
    const [actionsCount, approvedActionsCount, permissionsCount, achievementsCount] =
      await Promise.all([
        AppDataSource.query('SELECT COUNT(*) as count FROM actions WHERE "userId" = $1', [
          userId,
        ]),
        AppDataSource.query(
          'SELECT COUNT(*) as count FROM actions WHERE "userId" = $1 AND status = $2',
          [userId, 'approved']
        ),
        AppDataSource.query(
          'SELECT COUNT(*) as count FROM permissions WHERE "requesterId" = $1',
          [userId]
        ),
        AppDataSource.query(
          'SELECT COUNT(*) as count FROM achievements WHERE "userId" = $1 AND "isUnlocked" = true',
          [userId]
        ),
      ]);

    return {
      totalPoints: user.totalPoints,
      currentLevel: user.currentLevel,
      pointsInCurrentLevel: user.pointsInCurrentLevel,
      actionsCreated: parseInt(actionsCount[0].count),
      actionsApproved: parseInt(approvedActionsCount[0].count),
      permissionsRequested: parseInt(permissionsCount[0].count),
      achievementsUnlocked: parseInt(achievementsCount[0].count),
    };
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    await this.getUserById(userId); // validates user exists
    const achievementRepository = AppDataSource.getRepository(Achievement);
    return achievementRepository.find({
      where: { userId },
      order: { unlockedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async generateUniquePartnerCode(): Promise<string> {
    const MAX_ATTEMPTS = 10;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const code = generatePartnerCode();
      const existingUser = await this.userRepository.findOne({
        where: { partnerCode: code },
      });
      if (!existingUser) return code;
    }
    throw new AppError(500, 'No se pudo generar un código único. Intenta de nuevo.');
  }

  private async purgeLocalUserData(userId: string): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      await manager.query('DELETE FROM logs WHERE "userId" = $1', [userId]);
      await manager.query('DELETE FROM achievements WHERE "userId" = $1', [userId]);
      await manager.query('DELETE FROM permissions WHERE "requesterId" = $1', [userId]);
      await manager.query('DELETE FROM actions WHERE "userId" = $1', [userId]);

      const partnerLinks: { id: string }[] = await manager.query(
        'SELECT id FROM partner_links WHERE "user1Id" = $1 OR "user2Id" = $1',
        [userId]
      );

      if (partnerLinks.length > 0) {
        const partnerLinkIds = partnerLinks.map((pl) => pl.id);
        await manager.query(
          `DELETE FROM permissions WHERE "templateId" IN (
            SELECT id FROM permission_templates WHERE "partnerLinkId" = ANY($1)
          )`,
          [partnerLinkIds]
        );
        await manager.query(
          'DELETE FROM permission_templates WHERE "partnerLinkId" = ANY($1)',
          [partnerLinkIds]
        );
        await manager.query('DELETE FROM partner_links WHERE id = ANY($1)', [
          partnerLinkIds,
        ]);
      }

      await manager.query('DELETE FROM users WHERE id = $1', [userId]);
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.getUserById(userId);

    await this.purgeLocalUserData(userId);

    const { clerkClient } = await import('../config/clerk');
    let clerkDeleted = false;
    for (let attempt = 1; attempt <= 2 && !clerkDeleted; attempt++) {
      try {
        await clerkClient.users.deleteUser(user.clerkId);
        clerkDeleted = true;
        logger.info({ userId, clerkId: user.clerkId }, 'Clerk account deleted');
      } catch (clerkError) {
        logger.warn(
          { err: clerkError, userId, attempt },
          'Failed to delete Clerk account after DB deletion'
        );
        if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    if (!clerkDeleted) {
      logger.error(
        { userId, clerkId: user.clerkId },
        'Clerk account deletion failed after retry — local data already purged'
      );
    }

    logger.info({ userId }, 'Account permanently deleted');
  }

  async purgeUserByClerkId(clerkId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { clerkId } });
    if (!user) {
      logger.debug({ clerkId }, 'user.deleted webhook: no matching local user, nothing to purge');
      return;
    }
    await this.purgeLocalUserData(user.id);
    logger.info({ userId: user.id, clerkId }, 'Local user data purged via Clerk webhook');
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async activateUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    user.isActive = true;
    await this.userRepository.save(user);
  }
}
