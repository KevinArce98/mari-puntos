// ============================================
// API Response Types
// ============================================

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

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Enums
// ============================================

export enum ActionCategory {
  HOUSEHOLD = 'household',
  CHILDCARE = 'childcare',
  ERRANDS = 'errands',
  ROMANTIC = 'romantic',
  PERSONAL_GROWTH = 'personal_growth',
  OTHER = 'other',
}

export enum ActionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PermissionCategory {
  GAMING = 'gaming',
  SOCIAL = 'social',
  SPORTS = 'sports',
  HOBBIES = 'hobbies',
  ENTERTAINMENT = 'entertainment',
  PERSONAL_TIME = 'personal_time',
  OTHER = 'other',
}

export enum PermissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum RewardCategory {
  PERSONAL_TIME = 'personal_time',
  ENTERTAINMENT = 'entertainment',
  GIFTS = 'gifts',
  EXPERIENCES = 'experiences',
  PRIVILEGES = 'privileges',
  OTHER = 'other',
}

export enum AchievementType {
  POINTS_MILESTONE = 'points_milestone',
  LEVEL_MILESTONE = 'level_milestone',
  ACTIONS_COMPLETED = 'actions_completed',
  PERMISSIONS_GRANTED = 'permissions_granted',
  STREAK = 'streak',
  SPECIAL = 'special',
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: AchievementType;
  iconUrl?: string;
  pointsReward?: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  requiredValue?: number;
  currentProgress: number;
  createdAt: string;
}

export enum LogType {
  POINTS_EARNED = 'points_earned',
  POINTS_SPENT = 'points_spent',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  PERMISSION_REQUESTED = 'permission_requested',
  PERMISSION_APPROVED = 'permission_approved',
  PERMISSION_REJECTED = 'permission_rejected',
  ACTION_CREATED = 'action_created',
  ACTION_APPROVED = 'action_approved',
  ACTION_REJECTED = 'action_rejected',
  REWARD_REDEEMED = 'reward_redeemed',
  PARTNER_LINKED = 'partner_linked',
  OTHER = 'other',
}

// ============================================
// User Types
// ============================================

export interface User {
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

export interface UserStats {
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  actionsCreated: number;
  actionsApproved: number;
  permissionsRequested: number;
  achievementsUnlocked: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  pushToken?: string;
  profileImage?: string; // base64 encoded image
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  clerkId?: string; // Optional - comes from auth token on backend
  avatarUrl?: string;
}

// ============================================
// Partner Types
// ============================================

export interface CreatePartnerLinkResponse {
  linkCode: string;
  status: 'pending' | 'active';
}

export interface GetPartnerLinkCodeResponse {
  linkCode: string;
  status: 'pending' | 'active' | 'inactive';
}

export interface JoinPartnerRequest {
  linkCode: string;
}

export interface JoinPartnerResponse {
  linkCode: string;
  status: 'active';
  linkedAt: string;
}

export interface PartnerInfo {
  id: string;
  linkCode: string;
  status: 'pending' | 'active';
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

// ============================================
// Action Types
// ============================================

export interface Action {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: ActionCategory;
  status: ActionStatus;
  pointsAwarded: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionRequest {
  title: string;
  description?: string;
  category: ActionCategory;
  metadata?: Record<string, any>;
}

export interface ApproveActionRequest {
  pointsAwarded: number;
}

export interface RejectActionRequest {
  rejectionReason: string;
}

export interface GetActionsParams extends PaginationParams {
  status?: ActionStatus;
}

// ============================================
// Permission Template Types
// ============================================

export interface PermissionTemplate {
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

// ============================================
// Permission Types
// ============================================

export interface Permission {
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
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  template?: PermissionTemplate;
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

export interface CreatePermissionRequest {
  templateId: string;
  requestedDate: string;
  durationHours: number;
  metadata?: Record<string, any>;
}

export interface CreatePermissionTemplateRequest {
  title: string;
  description?: string;
  category: PermissionCategory;
  suggestedDurationHours?: number;
  suggestedPointsCost?: number;
  metadata?: Record<string, any>;
}

export interface GetPermissionTemplatesParams extends PaginationParams {
  category?: PermissionCategory;
  isSystemTemplate?: boolean;
}

export interface RespondPermissionRequest {
  approved: boolean;
  responseMessage?: string;
  pointsCost?: number; // Required when approving
}

export interface GetPermissionsParams extends PaginationParams {
  status?: PermissionStatus;
}

// ============================================
// Reward Types
// ============================================

export interface Reward {
  id: string;
  title: string;
  description?: string;
  category: RewardCategory;
  pointsCost: number;
  requiredLevel: number;
  imageUrl?: string;
  isActive: boolean;
  isCustom: boolean;
  createdBy?: string;
  partnerLinkId?: string;
  timesRedeemed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRewardRequest {
  title: string;
  description?: string;
  category: RewardCategory;
  pointsCost: number;
  requiredLevel: number;
  imageUrl?: string;
}

export interface GetRewardsParams extends PaginationParams {
  category?: RewardCategory;
  isActive?: boolean;
}

export interface RedeemRewardRequest {
  rewardId: string;
}

// ============================================
// Points Types
// ============================================

export interface PointsLog {
  id: string;
  type: LogType;
  message: string;
  pointsChange: number;
  createdAt: string;
}

export type GetPointsHistoryParams = PaginationParams;

export interface LeaderboardEntry {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  totalPoints: number;
  currentLevel: number;
}

export interface GetLeaderboardParams {
  limit?: number;
}
