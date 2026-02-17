import { z } from 'zod';
import { ActionCategory } from '@/types';

export const createActionSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'El título debe tener máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción debe tener máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  category: z.enum(ActionCategory, { error: 'La categoría es requerida' }),
});

export type CreateActionFormData = z.infer<typeof createActionSchema>;

export const responseMessageSchema = z.object({
  message: z
    .string()
    .max(500, 'El mensaje debe tener máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  pointsCost: z
    .number()
    .min(0, 'Los puntos deben ser 0 o más')
    .max(1000, 'Máximo 1000 puntos')
    .optional(),
});

export type ResponseMessageFormData = z.infer<typeof responseMessageSchema>;

export const reviewActionSchema = z.object({
  points: z.number().min(0).max(1000),
  rejectionReason: z
    .string()
    .min(1, 'La razón es requerida')
    .max(500, 'La razón debe tener máximo 500 caracteres')
    .optional(),
});

export type ReviewActionFormData = z.infer<typeof reviewActionSchema>;
