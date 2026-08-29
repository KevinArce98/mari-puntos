import { z } from 'zod';

import i18n from '@/i18n';

import { passwordSchema } from './password.rules';

const email = () =>
  z
    .email({ error: () => i18n.t('validation:email.invalid') })
    .min(1, { error: () => i18n.t('validation:email.required') })
    .toLowerCase();

const code = () =>
  z
    .string()
    .length(6, { error: () => i18n.t('validation:auth.codeLength') })
    .regex(/^\d+$/, { error: () => i18n.t('validation:auth.codeDigits') });

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { error: () => i18n.t('validation:auth.firstNameRequired') })
      .max(50, { error: () => i18n.t('validation:auth.firstNameMax') })
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
        error: () => i18n.t('validation:auth.firstNameLetters'),
      }),
    lastName: z
      .string()
      .max(50, { error: () => i18n.t('validation:auth.lastNameMax') })
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, {
        error: () => i18n.t('validation:auth.lastNameLetters'),
      })
      .optional()
      .or(z.literal('')),
    email: email(),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { error: () => i18n.t('validation:auth.confirmPasswordRequired') }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: () => i18n.t('validation:auth.passwordsMismatch'),
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: email(),
  password: z
    .string()
    .min(1, { error: () => i18n.t('validation:auth.passwordRequired') }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  code: code(),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: email(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    code: code(),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { error: () => i18n.t('validation:auth.confirmPasswordRequired') }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: () => i18n.t('validation:auth.passwordsMismatch'),
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
