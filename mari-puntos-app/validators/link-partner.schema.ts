import { z } from 'zod';

export const linkPartnerSchema = z.object({
  partnerCode: z
    .string()
    .min(6, 'El código debe tener exactamente 6 caracteres')
    .max(6, 'El código debe tener exactamente 6 caracteres')
    .regex(/^[A-Z0-9]+$/, 'El código solo puede contener letras mayúsculas y números'),
});

export type LinkPartnerFormData = z.infer<typeof linkPartnerSchema>;
