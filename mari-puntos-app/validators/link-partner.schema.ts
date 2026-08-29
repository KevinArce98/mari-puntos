import { z } from 'zod';

import i18n from '@/i18n';

export const linkPartnerSchema = z.object({
  partnerCode: z
    .string()
    .min(6, { error: () => i18n.t('validation:linkPartner.codeLength') })
    .max(6, { error: () => i18n.t('validation:linkPartner.codeLength') })
    .regex(/^[A-Z0-9]+$/, {
      error: () => i18n.t('validation:linkPartner.codeFormat'),
    }),
});

export type LinkPartnerFormData = z.infer<typeof linkPartnerSchema>;
