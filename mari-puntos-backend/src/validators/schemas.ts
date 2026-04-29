/**
 * Zod validation schemas for API requests
 * ⚠️ These MUST match the frontend request DTOs exactly
 */
import { z } from 'zod';

import { PermissionCategory } from '../entities/PermissionTemplate';
import {
  ActionCategory,
  ActionStatus,
  PAGINATION_DEFAULTS,
  PermissionStatus,
} from '../shared/constants';

// ============================================================================
// USER SCHEMAS (Matches frontend CreateUserRequest, UpdateProfileRequest)
// ============================================================================

export const createUserSchema = z.object({
  email: z.email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  avatarUrl: z.url('Invalid URL').optional(),
  // clerkId is intentionally NOT accepted from body — derived from JWT to prevent mass assignment
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  pushToken: z.string().optional(),
  profileImage: z.string().optional(), // base64 encoded image
});

export const sendTestNotificationSchema = z.object({
  pushToken: z.string().min(1, 'Push token is required'),
  title: z.string().min(1, 'Title is required').optional(),
  body: z.string().min(1, 'Body is required').optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// PARTNER SCHEMAS (Matches frontend CreatePartnerLinkRequest, JoinPartnerRequest)
// ============================================================================

export const joinPartnerLinkSchema = z.object({
  linkCode: z.string().length(6, 'Link code must be 6 characters'),
});

// ============================================================================
// ACTION SCHEMAS (Matches frontend CreateActionRequest, ApproveActionRequest, RejectActionRequest)
// ============================================================================

export const createActionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z
    .enum([
      ActionCategory.HOUSEHOLD,
      ActionCategory.CHILDCARE,
      ActionCategory.ERRANDS,
      ActionCategory.ROMANTIC,
      ActionCategory.PERSONAL_GROWTH,
      ActionCategory.OTHER,
    ])
    .default(ActionCategory.OTHER),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateActionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z
    .enum([
      ActionCategory.HOUSEHOLD,
      ActionCategory.CHILDCARE,
      ActionCategory.ERRANDS,
      ActionCategory.ROMANTIC,
      ActionCategory.PERSONAL_GROWTH,
      ActionCategory.OTHER,
    ])
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const approveActionSchema = z.object({
  pointsAwarded: z.number().int().min(0).max(1000),
});

export const rejectActionSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required').max(500),
});

// ============================================================================
// PERMISSION SCHEMAS (Matches frontend CreatePermissionRequest, RespondPermissionRequest)
// ============================================================================

export const createPermissionSchema = z.object({
  templateId: z.uuid('Invalid template ID'),
  requestedDate: z.iso.datetime({ message: 'Invalid date format' }),
  durationHours: z.number().min(0.5).max(168), // Min 0.5 hours, Max 1 week
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const respondPermissionSchema = z.object({
  approved: z.boolean(),
  responseMessage: z.string().max(500).optional(),
  pointsCost: z.number().int().min(0).optional(), // Set by approver when approving
});

export const updatePermissionSchema = z.object({
  requestedDate: z.iso.datetime({ message: 'Invalid date format' }).optional(),
  durationHours: z.number().min(0.5).max(168).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// PERMISSION TEMPLATE SCHEMAS (Matches frontend CreatePermissionTemplateRequest, UpdatePermissionTemplateRequest)
// ============================================================================

export const createPermissionTemplateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(PermissionCategory),
  suggestedDurationHours: z.number().int().positive().optional(),
  suggestedPointsCost: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updatePermissionTemplateSchema = createPermissionTemplateSchema.partial();

// ============================================================================
// QUERY SCHEMAS (Matches frontend pagination and filter params)
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .optional()
    .default(PAGINATION_DEFAULTS.LIMIT),
});

export const actionsQuerySchema = z.object({
  status: z
    .enum([ActionStatus.PENDING, ActionStatus.APPROVED, ActionStatus.REJECTED])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PAGINATION_DEFAULTS.MAX_LIMIT).optional(),
});

export const permissionsQuerySchema = z.object({
  status: z
    .enum([
      PermissionStatus.PENDING,
      PermissionStatus.APPROVED,
      PermissionStatus.REJECTED,
      PermissionStatus.EXPIRED,
    ])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PAGINATION_DEFAULTS.MAX_LIMIT).optional(),
});

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type JoinPartnerLinkInput = z.infer<typeof joinPartnerLinkSchema>;
export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
export type ApproveActionInput = z.infer<typeof approveActionSchema>;
export type RejectActionInput = z.infer<typeof rejectActionSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type RespondPermissionInput = z.infer<typeof respondPermissionSchema>;
export type CreatePermissionTemplateInput = z.infer<
  typeof createPermissionTemplateSchema
>;
export type UpdatePermissionTemplateInput = z.infer<
  typeof updatePermissionTemplateSchema
>;
export type PaginationInput = z.infer<typeof paginationSchema>;
