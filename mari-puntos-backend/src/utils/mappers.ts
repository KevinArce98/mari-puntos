import { Achievement } from '../entities/Achievement';
import { Action } from '../entities/Action';
import { Level } from '../entities/Level';
import { Log } from '../entities/Log';
import { PartnerLink } from '../entities/PartnerLink';
import { Permission } from '../entities/Permission';
import { PermissionTemplate } from '../entities/PermissionTemplate';
import { User } from '../entities/User';
import { PartnerLinkStatus } from '../shared/constants';
import {
  AchievementDTO,
  ActionDTO,
  LeaderboardEntryDTO,
  LevelDTO,
  PartnerInfoDTO,
  PermissionDTO,
  PermissionTemplateDTO,
  PointsLogDTO,
  UserDTO,
  UserStatsDTO,
} from '../shared/dtos';

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
    locale: user.locale === 'en' ? 'en' : user.locale === 'es' ? 'es' : undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

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

export function toActionDTOList(actions: Action[]): ActionDTO[] {
  return actions.map(toActionDTO);
}

export function toPermissionTemplateDTO(
  template: PermissionTemplate
): PermissionTemplateDTO {
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
    template: permission.template
      ? toPermissionTemplateDTO(permission.template)
      : undefined,
    requester: permission.requester
      ? {
          id: permission.requester.id,
          firstName: permission.requester.firstName,
          lastName: permission.requester.lastName,
          email: permission.requester.email,
          avatarUrl: permission.requester.avatarUrl || undefined,
          totalPoints: permission.requester.totalPoints,
        }
      : undefined,
    approver: permission.approver
      ? {
          id: permission.approver.id,
          firstName: permission.approver.firstName,
          lastName: permission.approver.lastName,
          email: permission.approver.email,
          avatarUrl: permission.approver.avatarUrl || undefined,
        }
      : undefined,
  };
}

export function toPermissionDTOList(permissions: Permission[]): PermissionDTO[] {
  return permissions.map(toPermissionDTO);
}

export function toPermissionTemplateDTOList(
  templates: PermissionTemplate[]
): PermissionTemplateDTO[] {
  return templates.map(toPermissionTemplateDTO);
}

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

export function toAchievementDTOList(achievements: Achievement[]): AchievementDTO[] {
  return achievements.map(toAchievementDTO);
}

export function toPointsLogDTO(log: Log): PointsLogDTO {
  return {
    id: log.id,
    type: log.type,
    message: log.message,
    pointsChange: log.pointsChange,
    createdAt: log.createdAt.toISOString(),
  };
}

export function toPointsLogDTOList(logs: Log[]): PointsLogDTO[] {
  return logs.map(toPointsLogDTO);
}

export function toPartnerInfoDTO(
  partnerLink: PartnerLink,
  partner: User,
  _currentUserId: string
): PartnerInfoDTO {
  return {
    id: partnerLink.id,
    linkCode: partnerLink.linkCode,
    status:
      partnerLink.status === 'active'
        ? PartnerLinkStatus.ACTIVE
        : PartnerLinkStatus.PENDING,
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
