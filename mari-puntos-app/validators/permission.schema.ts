import { z } from 'zod';

import i18n from '@/i18n';
import { PermissionCategory } from '@/types';

const note = z
  .string()
  .max(500, { error: () => i18n.t('validation:permission.noteMax') })
  .optional()
  .or(z.literal(''));

const durationHours = z.number().min(0.5).max(8);

export const requestPermissionSchema = z.object({
  templateId: z
    .string()
    .min(1, { error: () => i18n.t('validation:permission.templateRequired') }),
  requestedDate: z.date(),
  requestedTime: z.date(),
  durationHours,
  note,
});

export type RequestPermissionFormData = z.infer<typeof requestPermissionSchema>;

export const editPermissionSchema = z.object({
  requestedDate: z.date(),
  requestedTime: z.date(),
  durationHours,
  note,
});

export type EditPermissionFormData = z.infer<typeof editPermissionSchema>;

const numericString = (isValid: (value: number) => boolean, error: () => string) =>
  z.string().refine(
    (value) => {
      const parsed = parseFloat(value);
      return !isNaN(parsed) && isValid(parsed);
    },
    { error }
  );

export const createTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('validation:permission.titleRequired') })
    .max(100, { error: () => i18n.t('validation:permission.titleMax') }),
  description: z
    .string()
    .max(500, { error: () => i18n.t('validation:permission.descriptionMax') })
    .optional()
    .or(z.literal('')),
  category: z.enum(PermissionCategory),
  suggestedDuration: numericString(
    (value) => value > 0,
    () => i18n.t('validation:permission.durationInvalid')
  ),
  suggestedPoints: numericString(
    (value) => value >= 0,
    () => i18n.t('validation:permission.pointsInvalid')
  ),
  icon: z.string(),
});

export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;
