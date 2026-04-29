import { AppDataSource } from '../config/db';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import { getISOWeekId, getPreviousWeekId } from '../utils/helpers';
import { logger } from '../utils/logger';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  currentWeekId: string;
  myWeekDone: boolean;
  partnerWeekDone: boolean;
  bothDoneThisWeek: boolean;
}

export class StreakService {
  private partnerLinkRepo = AppDataSource.getRepository(PartnerLink);

  async getStreak(userId: string): Promise<StreakInfo> {
    const link = await this.getActiveLink(userId);
    const currentWeekId = getISOWeekId();

    const changed = this.applyWeekTransition(link, currentWeekId);
    if (changed) await this.partnerLinkRepo.save(link);

    const { myWeekDone, partnerWeekDone } = this.resolveUserFlags(link, userId);

    return {
      currentStreak: link.currentStreak,
      longestStreak: link.longestStreak,
      currentWeekId,
      myWeekDone,
      partnerWeekDone,
      bothDoneThisWeek: link.user1WeekDone && link.user2WeekDone,
    };
  }

  async recordAction(userId: string): Promise<void> {
    const link = await this.getActiveLink(userId);
    const currentWeekId = getISOWeekId();
    const isUser1 = link.user1Id === userId;

    // Apply week transition before any other check
    this.applyWeekTransition(link, currentWeekId);

    // Already marked done this week — nothing to update
    const alreadyDone = isUser1 ? link.user1WeekDone : link.user2WeekDone;
    if (alreadyDone) return;

    // Mark this user as done
    if (isUser1) {
      link.user1WeekDone = true;
    } else {
      link.user2WeekDone = true;
    }

    // Both done → extend streak
    if (link.user1WeekDone && link.user2WeekDone) {
      link.currentStreak += 1;
      if (link.currentStreak > link.longestStreak) {
        link.longestStreak = link.currentStreak;
      }
      logger.info({ message: 'Streak extended', linkId: link.id, currentStreak: link.currentStreak });
    }

    await this.partnerLinkRepo.save(link);
  }

  /**
   * Checks if a new ISO week has started and resets/updates the link accordingly.
   * Returns true if the link was mutated (caller must persist).
   */
  private applyWeekTransition(link: PartnerLink, currentWeekId: string): boolean {
    if (link.currentWeekId === currentWeekId) return false;

    const prevWeekId = getPreviousWeekId(currentWeekId);
    const streakContinues =
      link.currentWeekId === prevWeekId && link.user1WeekDone && link.user2WeekDone;

    link.currentStreak = streakContinues ? link.currentStreak : 0;
    link.user1WeekDone = false;
    link.user2WeekDone = false;
    link.currentWeekId = currentWeekId;

    if (!streakContinues) {
      logger.info({ message: 'Streak reset — week skipped', linkId: link.id });
    }

    return true;
  }

  private async getActiveLink(userId: string): Promise<PartnerLink> {
    const link = await this.partnerLinkRepo.findOne({
      where: [
        { user1Id: userId, status: PartnerLinkStatus.ACTIVE },
        { user2Id: userId, status: PartnerLinkStatus.ACTIVE },
      ],
    });

    if (!link) throw new Error('No active partner link found');
    return link;
  }

  private resolveUserFlags(
    link: PartnerLink,
    userId: string
  ): { myWeekDone: boolean; partnerWeekDone: boolean } {
    const isUser1 = link.user1Id === userId;
    return {
      myWeekDone: isUser1 ? link.user1WeekDone : link.user2WeekDone,
      partnerWeekDone: isUser1 ? link.user2WeekDone : link.user1WeekDone,
    };
  }
}
