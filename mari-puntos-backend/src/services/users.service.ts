import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { AppError } from '../middlewares/errorMiddleware';
import { generatePartnerCode } from '../utils/helpers';
import { CreateUserInput, UpdateUserInput } from '../validators/schemas';
import { logger } from '../utils/logger';

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
  async createUser(data: CreateUserInput): Promise<User> {
    logger.info({ message: 'Creating user with clerkId', clerkId: data.clerkId });

    // Check if user already exists with this clerkId
    const existingUser = await this.userRepository.findOne({
      where: { clerkId: data.clerkId },
    });

    if (existingUser) {
      logger.warn({ message: 'User already exists with clerkId', clerkId: data.clerkId });
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
    if (data.clerkId) {
      try {
        const { clerkClient } = await import('../config/clerk');
        const clerkUser = await clerkClient.users.getUser(String(data.clerkId));
        if (clerkUser.imageUrl) {
          avatarUrl = clerkUser.imageUrl;
          logger.debug({ message: 'Fetched avatar URL from Clerk', avatarUrl });
        }
      } catch (clerkError) {
        logger.warn({ err: clerkError }, 'Failed to fetch avatar from Clerk, using provided avatarUrl');
      }
    }

    const user = this.userRepository.create({
      clerkId: String(data.clerkId),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl,
    });

    const savedUser = await this.userRepository.save(user);
    logger.info({ message: 'User created successfully with id', userId: savedUser.id });

    return savedUser;
  }

  /**
   * Update user profile - returns user and hasPartner flag
   * Also updates Clerk profile if firstName, lastName, or profileImage are provided
   */
  async updateUser(
    userId: string,
    data: UpdateUserInput
  ): Promise<{ user: User; hasPartner: boolean }> {
    logger.debug({ message: 'Updating user', userId });

    const user = await this.getUserById(userId);

    // Update Clerk profile if needed
    if (
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.profileImage !== undefined
    ) {
      try {
        const { clerkClient } = await import('../config/clerk');

        // Update profile image in Clerk if provided
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

        // Update firstName/lastName in Clerk if provided
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
        if (clerkUser.imageUrl) {
          user.avatarUrl = clerkUser.imageUrl;
          logger.debug({
            message: 'Synced avatar URL from Clerk',
            avatarUrl: clerkUser.imageUrl,
          });
        }
      } catch (clerkError) {
        logger.error({ err: clerkError, userId }, 'Failed to update Clerk profile');
        const errorMessage =
          clerkError instanceof Error ? clerkError.message : 'Unknown error';
        throw new Error(`Failed to update profile in Clerk: ${errorMessage}`, {
          cause: clerkError,
        });
      }
    }

    // Update local database
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.pushToken !== undefined) user.pushToken = data.pushToken;

    await this.userRepository.save(user);

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
    return !!partnerLink && partnerLink.status === 'active';
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

    // Get actions count
    const actionsCount = await AppDataSource.query(
      'SELECT COUNT(*) as count FROM actions WHERE "userId" = $1',
      [userId]
    );

    // Get approved actions count
    const approvedActionsCount = await AppDataSource.query(
      'SELECT COUNT(*) as count FROM actions WHERE "userId" = $1 AND status = $2',
      [userId, 'approved']
    );

    // Get permissions count
    const permissionsCount = await AppDataSource.query(
      'SELECT COUNT(*) as count FROM permissions WHERE "requesterId" = $1',
      [userId]
    );

    // Get achievements count
    const achievementsCount = await AppDataSource.query(
      'SELECT COUNT(*) as count FROM achievements WHERE "userId" = $1 AND "isUnlocked" = true',
      [userId]
    );

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
