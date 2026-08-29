import { PermissionCategory } from '../entities/PermissionTemplate';
import {
  ActionCategory,
  ActionStatus,
  LogType,
  PartnerLinkStatus,
  PermissionStatus,
} from './constants';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: {
    field: string;
    message: string;
  }[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export type AppLocale = 'es' | 'en';

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  partnerCode?: string;
  hasPartner: boolean;
  isActive: boolean;
  locale?: AppLocale;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatsDTO {
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  actionsCreated: number;
  actionsApproved: number;
  permissionsRequested: number;
  achievementsUnlocked: number;
}

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  clerkId: string;
  avatarUrl?: string;
  locale?: AppLocale;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  locale?: AppLocale;
}

export interface CreatePartnerLinkResponseDTO {
  linkCode: string;
  status: PartnerLinkStatus;
}

export interface JoinPartnerDTO {
  linkCode: string;
}

export interface JoinPartnerResponseDTO {
  linkCode: string;
  status: 'active';
  linkedAt: string;
}

export interface PartnerInfoDTO {
  id: string;
  linkCode: string;
  status: PartnerLinkStatus;
  linkedAt: string;
  partner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    totalPoints: number;
    currentLevel: number;
  };
}

export interface ActionDTO {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: ActionCategory;
  status: ActionStatus;
  pointsAwarded: number;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionDTO {
  title: string;
  description?: string;
  category: ActionCategory;
  metadata?: Record<string, unknown>;
}

export interface ApproveActionDTO {
  pointsAwarded: number;
}

export interface RejectActionDTO {
  rejectionReason: string;
}

export interface GetActionsParamsDTO extends PaginationParams {
  status?: ActionStatus;
}

export interface PermissionTemplateDTO {
  id: string;
  title: string;
  description?: string;
  category: PermissionCategory;
  suggestedDurationHours?: number;
  suggestedPointsCost?: number;
  isSystemTemplate: boolean;
  isActive: boolean;
  partnerLinkId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionDTO {
  id: string;
  templateId: string;
  requesterId: string;
  approverId?: string;
  status: PermissionStatus;
  requestedDate: string;
  durationHours: number;
  pointsCost?: number;
  responseMessage?: string;
  respondedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  template?: PermissionTemplateDTO;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    totalPoints: number;
  };
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreatePermissionDTO {
  templateId: string;
  requestedDate: string;
  durationHours: number;
  metadata?: Record<string, unknown>;
}

export interface RespondPermissionDTO {
  approved: boolean;
  responseMessage?: string;
  pointsCost?: number;
}

export interface GetPermissionsParamsDTO extends PaginationParams {
  status?: PermissionStatus;
}

export interface PointsLogDTO {
  id: string;
  type: LogType;
  message: string;
  pointsChange: number;
  createdAt: string;
}

export type GetPointsHistoryParamsDTO = PaginationParams;

export interface LeaderboardEntryDTO {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  totalPoints: number;
  currentLevel: number;
}

export interface GetLeaderboardParamsDTO {
  limit?: number;
}

export interface LevelDTO {
  id: string;
  levelNumber: number;
  title: string;
  description?: string;
  pointsRequired: number;
  iconUrl?: string;
  badgeUrl?: string;
}

export interface AchievementDTO {
  id: string;
  title: string;
  description?: string;
  type: string;
  iconUrl?: string;
  badgeUrl?: string;
  pointsReward?: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  requiredValue?: number;
  currentProgress: number;
}
