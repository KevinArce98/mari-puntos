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
  code?: string;
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
  PARTNER_LINKED = 'partner_linked',
  OTHER = 'other',
}

export type AppLocale = 'es' | 'en';

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
  locale?: AppLocale;
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
  profileImage?: string;
  locale?: AppLocale;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  clerkId?: string;
  avatarUrl?: string;
}

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
  pointsCost?: number;
}

export interface GetPermissionsParams extends PaginationParams {
  status?: PermissionStatus;
}

export interface PointsLog {
  id: string;
  type: LogType;
  message: string;
  pointsChange: number;
  createdAt: string;
}

export type GetPointsHistoryParams = PaginationParams;
