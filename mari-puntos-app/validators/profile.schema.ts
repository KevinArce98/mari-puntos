import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre es muy largo')
    .optional(),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido es muy largo')
    .optional(),
  profileImage: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
