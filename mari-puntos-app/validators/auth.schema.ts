import { z } from 'zod';

import { passwordSchema } from './password.rules';

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'El nombre es requerido')
      .max(50, 'El nombre debe tener máximo 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
    lastName: z
      .string()
      .max(50, 'El apellido debe tener máximo 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'El apellido solo puede contener letras')
      .optional()
      .or(z.literal('')),
    email: z
      .email('El correo electrónico no es válido')
      .min(1, 'El correo electrónico es requerido')
      .toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Debes confirmar tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .email('El correo electrónico no es válido')
    .min(1, 'El correo electrónico es requerido')
    .toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código solo puede contener números'),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .email('El correo electrónico no es válido')
    .min(1, 'El correo electrónico es requerido')
    .toLowerCase(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .length(6, 'El código debe tener 6 dígitos')
      .regex(/^\d+$/, 'El código solo puede contener números'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Debes confirmar tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
