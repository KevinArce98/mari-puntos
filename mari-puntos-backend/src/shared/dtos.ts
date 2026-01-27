// filepath: /Users/kevinarias/Projects/mari-puntos-backend/src/shared/dtos.ts

/**
 * Data Transfer Objects (DTOs) for MariPuntos API
 * ⚠️ These MUST match the frontend TypeScript interfaces EXACTLY
 * Frontend is the source of truth - backend adapts to frontend
 */

import { PermissionCategory } from '../entities/PermissionTemplate';
import {
  ActionStatus,
  ActionCategory,
  PermissionStatus,
  RewardCategory,
  PartnerLinkStatus,
  LogType,
} from './constants';

// ============================================================================
// API RESPONSE TYPES (Matches frontend ApiResponse)
// ============================================================================

/**
 * Standard success response format
 * Frontend expects: { success: true, data: T, message?: string }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Standard error response format
 * Frontend expects: { success: false, error: string, details?: { field, message }[] }
 */
export interface ApiError {
  success: false;
  error: string;
  details?: {
    field: string;
    message: string;
  }[];
}

// ============================================================================
// PAGINATION (Matches frontend exactly)
// ============================================================================

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

/**
 * Paginated response format
 * Frontend expects: { success: boolean, data: T[], pagination: {...} }
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ============================================================================
// USER DTOs (Matches frontend User interface exactly)
// ============================================================================

/**
 * User response DTO - matches frontend User interface
 */
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
  createdAt: string;
  updatedAt: string;
}

/**
 * User stats response DTO - matches frontend UserStats interface
 */
export interface UserStatsDTO {
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  actionsCreated: number;
  actionsApproved: number;
  permissionsRequested: number;
  achievementsUnlocked: number;
}

/**
 * Create user request - matches frontend CreateUserRequest
 */
export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  clerkId: string;
  avatarUrl?: string;
}

/**
 * Update user request - matches frontend UpdateProfileRequest
 */
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
}

// ============================================================================
// PARTNER DTOs (Matches frontend Partner interfaces exactly)
// ============================================================================

/**
 * Create partner link response - matches frontend CreatePartnerLinkResponse
 */
export interface CreatePartnerLinkResponseDTO {
  linkCode: string;
  status: PartnerLinkStatus;
}

/**
 * Join partner request - matches frontend JoinPartnerRequest
 */
export interface JoinPartnerDTO {
  linkCode: string;
}

/**
 * Join partner response - matches frontend JoinPartnerResponse
 */
export interface JoinPartnerResponseDTO {
  linkCode: string;
  status: 'active';
  linkedAt: string;
}

/**
 * Partner info response - matches frontend PartnerInfo
 */
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

// ============================================================================
// ACTION DTOs (Matches frontend Action interfaces exactly)
// ============================================================================

/**
 * Action response DTO - matches frontend Action interface
 */
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

/**
 * Create action request - matches frontend CreateActionRequest
 */
export interface CreateActionDTO {
  title: string;
  description?: string;
  category: ActionCategory;
  metadata?: Record<string, unknown>;
}

/**
 * Approve action request - matches frontend ApproveActionRequest
 */
export interface ApproveActionDTO {
  pointsAwarded: number;
}

/**
 * Reject action request - matches frontend RejectActionRequest
 */
export interface RejectActionDTO {
  rejectionReason: string;
}

/**
 * Get actions query params - matches frontend GetActionsParams
 */
export interface GetActionsParamsDTO extends PaginationParams {
  status?: ActionStatus;
}

// ============================================================================
// PERMISSION DTOs (Matches frontend Permission interfaces exactly)
// ============================================================================

/**
 * Permission Template response DTO - matches frontend PermissionTemplate interface
 */
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
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission response DTO - matches frontend Permission interface
 */
export interface PermissionDTO {
  id: string;
  templateId: string;
  requesterId: string;
  approverId?: string;
  status: PermissionStatus;
  requestedDate: string;
  durationHours: number;
  pointsCost: number;
  responseMessage?: string;
  respondedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  template?: PermissionTemplateDTO;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

/**
 * Create permission request - matches frontend CreatePermissionRequest
 */
export interface CreatePermissionDTO {
  templateId: string;
  requestedDate: string;
  durationHours: number;
  pointsCost: number;
  metadata?: Record<string, any>;
}

/**
 * Respond to permission request - matches frontend RespondPermissionRequest
 */
export interface RespondPermissionDTO {
  approved: boolean;
  responseMessage?: string;
}

/**
 * Get permissions query params - matches frontend GetPermissionsParams
 */
export interface GetPermissionsParamsDTO extends PaginationParams {
  status?: PermissionStatus;
}

// ============================================================================
// REWARD DTOs (Matches frontend Reward interfaces exactly)
// ============================================================================

/**
 * Reward response DTO - matches frontend Reward interface
 */
export interface RewardDTO {
  id: string;
  title: string;
  description?: string;
  category: RewardCategory;
  pointsCost: number;
  requiredLevel: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create reward request - matches frontend CreateRewardRequest
 */
export interface CreateRewardDTO {
  title: string;
  description?: string;
  category: RewardCategory;
  pointsCost: number;
  requiredLevel: number;
  imageUrl?: string;
}

/**
 * Redeem reward request - matches frontend RedeemRewardRequest
 */
export interface RedeemRewardDTO {
  rewardId: string;
}

/**
 * Get rewards query params - matches frontend GetRewardsParams
 */
export interface GetRewardsParamsDTO extends PaginationParams {
  category?: RewardCategory;
  isActive?: boolean;
}

// ============================================================================
// POINTS DTOs (Matches frontend Points interfaces exactly)
// ============================================================================

/**
 * Points log response DTO - matches frontend PointsLog interface
 */
export interface PointsLogDTO {
  id: string;
  type: LogType;
  message: string;
  pointsChange: number;
  createdAt: string;
}

/**
 * Get points history params - matches frontend GetPointsHistoryParams
 */
export type GetPointsHistoryParamsDTO = PaginationParams;

/**
 * Leaderboard entry response - matches frontend LeaderboardEntry
 */
export interface LeaderboardEntryDTO {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  totalPoints: number;
  currentLevel: number;
}

/**
 * Get leaderboard params - matches frontend GetLeaderboardParams
 */
export interface GetLeaderboardParamsDTO {
  limit?: number;
}

// ============================================================================
// LEVEL DTOs
// ============================================================================

export interface LevelDTO {
  id: string;
  levelNumber: number;
  title: string;
  description?: string;
  pointsRequired: number;
  iconUrl?: string;
  badgeUrl?: string;
}

// ============================================================================
// ACHIEVEMENT DTOs
// ============================================================================

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
