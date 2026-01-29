import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { AppError } from '../middlewares/errorMiddleware';
import { generatePartnerCode } from '../utils/helpers';
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
  async createUser(data: CreateUserInput): Promise<User> {
    // Check if user already exists with this clerkId
    const existingUser = await this.userRepository.findOne({ 
      where: { clerkId: data.clerkId } 
    });

    if (existingUser) {
      throw new AppError(409, 'El usuario ya existe');
    }

    // Check if email is already in use
    const emailInUse = await this.userRepository.findOne({ 
      where: { email: data.email } 
    });

    if (emailInUse) {
      throw new AppError(409, 'El correo electrónico ya está en uso');
    }

    const user = this.userRepository.create({
      clerkId: data.clerkId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
    });

    return this.userRepository.save(user);
  }

  /**
   * Update user profile - returns user and hasPartner flag
   */
  async updateUser(userId: string, data: UpdateUserInput): Promise<{ user: User; hasPartner: boolean }> {
    const user = await this.getUserById(userId);

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;

    await this.userRepository.save(user);

    const hasPartner = this.checkHasPartner(user);

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
