import { z } from 'zod';

import i18n from '@/i18n';
import { ActionCategory } from '@/types';

export const createActionSchema = z.object({
  title: z
    .string()
    .min(1, { error: () => i18n.t('validation:action.titleRequired') })
    .max(100, { error: () => i18n.t('validation:action.titleMax') }),
  description: z
    .string()
    .max(500, { error: () => i18n.t('validation:action.descriptionMax') })
    .optional()
    .or(z.literal('')),
  category: z.enum(ActionCategory, {
    error: () => i18n.t('validation:action.categoryRequired'),
  }),
});

export type CreateActionFormData = z.infer<typeof createActionSchema>;

export const responseMessageSchema = z.object({
  message: z
    .string()
    .max(500, { error: () => i18n.t('validation:action.messageMax') })
    .optional()
    .or(z.literal('')),
  pointsCost: z
    .number()
    .min(0, { error: () => i18n.t('validation:action.pointsMin') })
    .max(1000, { error: () => i18n.t('validation:action.pointsMax') })
    .optional(),
});

export type ResponseMessageFormData = z.infer<typeof responseMessageSchema>;

export const reviewActionSchema = z.object({
  points: z.number().min(0).max(1000),
  rejectionReason: z
    .string()
    .min(1, { error: () => i18n.t('validation:action.reasonRequired') })
    .max(500, { error: () => i18n.t('validation:action.reasonMax') })
    .optional(),
});

export type ReviewActionFormData = z.infer<typeof reviewActionSchema>;
