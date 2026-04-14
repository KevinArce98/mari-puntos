/**
 * Mapper functions to convert DB entities to API DTOs
 * These ensure we never leak raw DB models to the frontend
 */

import { User } from '../entities/User';
import { Action } from '../entities/Action';
import { Permission } from '../entities/Permission';
import { PermissionTemplate } from '../entities/PermissionTemplate';
import { Reward } from '../entities/Reward';
import { Level } from '../entities/Level';
import { Achievement } from '../entities/Achievement';
import { Log } from '../entities/Log';
import { PartnerLink } from '../entities/PartnerLink';
import {
  UserDTO,
  UserStatsDTO,
  ActionDTO,
  PermissionDTO,
  PermissionTemplateDTO,
  RewardDTO,
  LevelDTO,
  AchievementDTO,
  PointsLogDTO,
  LeaderboardEntryDTO,
  PartnerInfoDTO,
} from '../shared/dtos';
import { PartnerLinkStatus } from '../shared/constants';

// ============================================================================
// USER MAPPERS
// ============================================================================

/**
 * Convert User entity to UserDTO
 * Matches frontend User interface exactly
 */
export function toUserDTO(user: User, hasPartner: boolean = false): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatarUrl: user.avatarUrl || undefined,
    totalPoints: user.totalPoints,
    currentLevel: user.currentLevel,
    pointsInCurrentLevel: user.pointsInCurrentLevel,
    partnerCode: user.partnerCode || undefined,
    hasPartner,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Convert user stats data to UserStatsDTO
 */
export function toUserStatsDTO(stats: {
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  actionsCreated: number;
  actionsApproved: number;
  permissionsRequested: number;
  achievementsUnlocked: number;
}): UserStatsDTO {
  return {
    totalPoints: stats.totalPoints,
    currentLevel: stats.currentLevel,
    pointsInCurrentLevel: stats.pointsInCurrentLevel,
    actionsCreated: stats.actionsCreated,
    actionsApproved: stats.actionsApproved,
    permissionsRequested: stats.permissionsRequested,
    achievementsUnlocked: stats.achievementsUnlocked,
  };
}

/**
 * Convert to LeaderboardEntryDTO
 */
export function toLeaderboardEntryDTO(user: User): LeaderboardEntryDTO {
  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatarUrl: user.avatarUrl || undefined,
    totalPoints: user.totalPoints,
    currentLevel: user.currentLevel,
  };
}

// ============================================================================
// ACTION MAPPERS
// ============================================================================

/**
 * Convert Action entity to ActionDTO
 * Matches frontend Action interface exactly
 */
export function toActionDTO(action: Action): ActionDTO {
  return {
    id: action.id,
    userId: action.userId,
    title: action.title,
    description: action.description || undefined,
    category: action.category,
    status: action.status,
    pointsAwarded: action.pointsAwarded,
    rejectionReason: action.rejectionReason || undefined,
    metadata: action.metadata || undefined,
    createdAt: action.createdAt.toISOString(),
    updatedAt: action.updatedAt.toISOString(),
  };
}

/**
 * Convert array of Action entities to ActionDTOs
 */
export function toActionDTOList(actions: Action[]): ActionDTO[] {
  return actions.map(toActionDTO);
}

// ============================================================================
// PERMISSION MAPPERS
// ============================================================================

/**
 * Convert PermissionTemplate entity to PermissionTemplateDTO
 * Matches frontend PermissionTemplate interface exactly
 */
export function toPermissionTemplateDTO(template: PermissionTemplate): PermissionTemplateDTO {
  return {
    id: template.id,
    title: template.title,
    description: template.description || undefined,
    category: template.category,
    suggestedDurationHours: template.suggestedDurationHours || undefined,
    suggestedPointsCost: template.suggestedPointsCost || undefined,
    isSystemTemplate: template.isSystemTemplate,
    isActive: template.isActive,
    partnerLinkId: template.partnerLinkId || undefined,
    metadata: template.metadata || undefined,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

/**
 * Convert Permission entity to PermissionDTO
 * Matches frontend Permission interface exactly
 */
export function toPermissionDTO(permission: Permission): PermissionDTO {
  return {
    id: permission.id,
    templateId: permission.templateId,
    requesterId: permission.requesterId,
    approverId: permission.approverId || undefined,
    status: permission.status,
    requestedDate: permission.requestedDate.toISOString(),
    durationHours: permission.durationHours,
    pointsCost: permission.pointsCost,
    responseMessage: permission.responseMessage || undefined,
    respondedAt: permission.respondedAt?.toISOString() || undefined,
    metadata: permission.metadata || undefined,
    createdAt: permission.createdAt.toISOString(),
    updatedAt: permission.updatedAt.toISOString(),
    template: permission.template ? toPermissionTemplateDTO(permission.template) : undefined,
    requester: permission.requester ? {
      id: permission.requester.id,
      firstName: permission.requester.firstName,
      lastName: permission.requester.lastName,
      email: permission.requester.email,
      avatarUrl: permission.requester.avatarUrl || undefined,
      totalPoints: permission.requester.totalPoints,
    } : undefined,
    approver: permission.approver ? {
      id: permission.approver.id,
      firstName: permission.approver.firstName,
      lastName: permission.approver.lastName,
      email: permission.approver.email,
      avatarUrl: permission.approver.avatarUrl || undefined,
    } : undefined,
  };
}

/**
 * Convert array of Permission entities to PermissionDTOs
 */
export function toPermissionDTOList(permissions: Permission[]): PermissionDTO[] {
  return permissions.map(toPermissionDTO);
}

/**
 * Convert array of PermissionTemplate entities to PermissionTemplateDTOs
 */
export function toPermissionTemplateDTOList(templates: PermissionTemplate[]): PermissionTemplateDTO[] {
  return templates.map(toPermissionTemplateDTO);
}

// ============================================================================
// REWARD MAPPERS
// ============================================================================

/**
 * Convert Reward entity to RewardDTO
 * Matches frontend Reward interface exactly
 */
export function toRewardDTO(reward: Reward): RewardDTO {
  return {
    id: reward.id,
    title: reward.title,
    description: reward.description || undefined,
    category: reward.category,
    pointsCost: reward.pointsCost,
    requiredLevel: reward.requiredLevel || 1,
    imageUrl: reward.imageUrl || undefined,
    isActive: reward.isActive,
    createdAt: reward.createdAt.toISOString(),
    updatedAt: reward.updatedAt.toISOString(),
  };
}

/**
 * Convert array of Reward entities to RewardDTOs
 */
export function toRewardDTOList(rewards: Reward[]): RewardDTO[] {
  return rewards.map(toRewardDTO);
}

// ============================================================================
// LEVEL MAPPERS
// ============================================================================

/**
 * Convert Level entity to LevelDTO
 */
export function toLevelDTO(level: Level): LevelDTO {
  return {
    id: level.id,
    levelNumber: level.levelNumber,
    title: level.title,
    description: level.description || undefined,
    pointsRequired: level.pointsRequired,
    iconUrl: level.iconUrl || undefined,
    badgeUrl: level.badgeUrl || undefined,
  };
}

// ============================================================================
// ACHIEVEMENT MAPPERS
// ============================================================================

/**
 * Convert Achievement entity to AchievementDTO
 */
export function toAchievementDTO(achievement: Achievement): AchievementDTO {
  return {
    id: achievement.id,
    title: achievement.title,
    description: achievement.description || undefined,
    type: achievement.type,
    iconUrl: achievement.iconUrl || undefined,
    badgeUrl: achievement.badgeUrl || undefined,
    pointsReward: achievement.pointsReward || undefined,
    isUnlocked: achievement.isUnlocked,
    unlockedAt: achievement.unlockedAt?.toISOString() || undefined,
    requiredValue: achievement.requiredValue || undefined,
    currentProgress: achievement.currentProgress,
  };
}

/**
 * Convert array of Achievement entities to AchievementDTOs
 */
export function toAchievementDTOList(achievements: Achievement[]): AchievementDTO[] {
  return achievements.map(toAchievementDTO);
}

// ============================================================================
// LOG MAPPERS
// ============================================================================

/**
 * Convert Log entity to PointsLogDTO
 * Matches frontend PointsLog interface exactly
 */
export function toPointsLogDTO(log: Log): PointsLogDTO {
  return {
    id: log.id,
    type: log.type,
    message: log.message,
    pointsChange: log.pointsChange,
    createdAt: log.createdAt.toISOString(),
  };
}

/**
 * Convert array of Log entities to PointsLogDTOs
 */
export function toPointsLogDTOList(logs: Log[]): PointsLogDTO[] {
  return logs.map(toPointsLogDTO);
}

// ============================================================================
// PARTNER MAPPERS
// ============================================================================

/**
 * Convert PartnerLink and partner User to PartnerInfoDTO
 * Matches frontend PartnerInfo interface exactly
 */
export function toPartnerInfoDTO(
  partnerLink: PartnerLink,
  partner: User,
  _currentUserId: string
): PartnerInfoDTO {
  return {
    id: partnerLink.id,
    linkCode: partnerLink.linkCode,
    status: partnerLink.status === 'active' ? PartnerLinkStatus.ACTIVE : PartnerLinkStatus.PENDING,
    linkedAt: partnerLink.linkedAt?.toISOString() || '',
    partner: {
      id: partner.id,
      firstName: partner.firstName || '',
      lastName: partner.lastName || '',
      email: partner.email,
      avatarUrl: partner.avatarUrl || undefined,
      totalPoints: partner.totalPoints,
      currentLevel: partner.currentLevel,
    },
  };
}
