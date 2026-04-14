/**
 * Shared constants and enums for MariPuntos API
 * ⚠️ These MUST match the frontend types exactly - frontend is source of truth
 */

// ============================================================================
// ACTION ENUMS
// ============================================================================

export const ActionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];

// Matches frontend ActionCategory exactly
export const ActionCategory = {
  HOUSEHOLD: 'household',
  CHILDCARE: 'childcare',
  ERRANDS: 'errands',
  ROMANTIC: 'romantic',
  PERSONAL_GROWTH: 'personal_growth',
  OTHER: 'other',
} as const;

export type ActionCategory = (typeof ActionCategory)[keyof typeof ActionCategory];

// ============================================================================
// PERMISSION ENUMS
// ============================================================================

export const PermissionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export type PermissionStatus = (typeof PermissionStatus)[keyof typeof PermissionStatus];

// Matches frontend PermissionType exactly
export const PermissionType = {
  NIGHT_OUT: 'night_out',
  GAMING_SESSION: 'gaming_session',
  SPORTS_EVENT: 'sports_event',
  FRIENDS_HANGOUT: 'friends_hangout',
  HOBBY_TIME: 'hobby_time',
  OTHER: 'other',
} as const;

export type PermissionType = (typeof PermissionType)[keyof typeof PermissionType];

// ============================================================================
// REWARD ENUMS
// ============================================================================

// Matches frontend RewardCategory exactly
export const RewardCategory = {
  PERSONAL_TIME: 'personal_time',
  ENTERTAINMENT: 'entertainment',
  GIFTS: 'gifts',
  EXPERIENCES: 'experiences',
  PRIVILEGES: 'privileges',
  OTHER: 'other',
} as const;

export type RewardCategory = (typeof RewardCategory)[keyof typeof RewardCategory];

// ============================================================================
// PARTNER LINK ENUMS
// ============================================================================

// Matches frontend partner status exactly
export const PartnerLinkStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
} as const;

export type PartnerLinkStatus = (typeof PartnerLinkStatus)[keyof typeof PartnerLinkStatus];

// ============================================================================
// LOG TYPE ENUMS
// ============================================================================

// Matches frontend LogType exactly
export const LogType = {
  POINTS_EARNED: 'points_earned',
  POINTS_SPENT: 'points_spent',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  PERMISSION_REQUESTED: 'permission_requested',
  PERMISSION_APPROVED: 'permission_approved',
  PERMISSION_REJECTED: 'permission_rejected',
  ACTION_CREATED: 'action_created',
  ACTION_APPROVED: 'action_approved',
  ACTION_REJECTED: 'action_rejected',
  REWARD_REDEEMED: 'reward_redeemed',
  PARTNER_LINKED: 'partner_linked',
  PARTNER_UNLINKED: 'partner_unlinked',
  OTHER: 'other',
} as const;

export type LogType = (typeof LogType)[keyof typeof LogType];

// ============================================================================
// ERROR CODES
// ============================================================================

export const ErrorCode = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED: 'ROLE_REQUIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic errors
  INSUFFICIENT_POINTS: 'INSUFFICIENT_POINTS',
  PARTNER_NOT_LINKED: 'PARTNER_NOT_LINKED',
  PARTNER_ALREADY_LINKED: 'PARTNER_ALREADY_LINKED',
  INVALID_LINK_CODE: 'INVALID_LINK_CODE',
  LINK_CODE_EXPIRED: 'LINK_CODE_EXPIRED',
  ACTION_ALREADY_EVALUATED: 'ACTION_ALREADY_EVALUATED',
  PERMISSION_ALREADY_RESPONDED: 'PERMISSION_ALREADY_RESPONDED',
  REWARD_NOT_AVAILABLE: 'REWARD_NOT_AVAILABLE',
  LEVEL_REQUIREMENT_NOT_MET: 'LEVEL_REQUIREMENT_NOT_MET',
  CANNOT_EVALUATE_OWN_ACTION: 'CANNOT_EVALUATE_OWN_ACTION',
  CANNOT_RESPOND_OWN_PERMISSION: 'CANNOT_RESPOND_OWN_PERMISSION',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================================================
// HTTP STATUS MAPPING
// ============================================================================

export const ErrorCodeToHttpStatus: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.ROLE_REQUIRED]: 403,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.INSUFFICIENT_POINTS]: 400,
  [ErrorCode.PARTNER_NOT_LINKED]: 400,
  [ErrorCode.PARTNER_ALREADY_LINKED]: 409,
  [ErrorCode.INVALID_LINK_CODE]: 400,
  [ErrorCode.LINK_CODE_EXPIRED]: 400,
  [ErrorCode.ACTION_ALREADY_EVALUATED]: 409,
  [ErrorCode.PERMISSION_ALREADY_RESPONDED]: 409,
  [ErrorCode.REWARD_NOT_AVAILABLE]: 400,
  [ErrorCode.LEVEL_REQUIREMENT_NOT_MET]: 400,
  [ErrorCode.CANNOT_EVALUATE_OWN_ACTION]: 400,
  [ErrorCode.CANNOT_RESPOND_OWN_PERMISSION]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
};

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
