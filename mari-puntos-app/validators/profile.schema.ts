import { z } from 'zod';

import i18n from '@/i18n';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, { error: () => i18n.t('validation:profile.firstNameRequired') })
    .max(100, { error: () => i18n.t('validation:profile.firstNameMax') })
    .optional(),
  lastName: z
    .string()
    .min(1, { error: () => i18n.t('validation:profile.lastNameRequired') })
    .max(100, { error: () => i18n.t('validation:profile.lastNameMax') })
    .optional(),
  profileImage: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
