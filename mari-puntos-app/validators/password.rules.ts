import { z } from 'zod';

import i18n from '@/i18n';

export const PASSWORD_PATTERNS = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  symbol: /[^a-zA-Z0-9\s]/,
};

export const passwordSchema = z
  .string()
  .min(8, { error: () => i18n.t('validation:passwordRules.min') })
  .max(100, { error: () => i18n.t('validation:passwordRules.max') })
  .regex(PASSWORD_PATTERNS.lowercase, {
    error: () => i18n.t('validation:passwordRules.lowercase'),
  })
  .regex(PASSWORD_PATTERNS.uppercase, {
    error: () => i18n.t('validation:passwordRules.uppercase'),
  })
  .regex(PASSWORD_PATTERNS.number, {
    error: () => i18n.t('validation:passwordRules.number'),
  })
  .regex(PASSWORD_PATTERNS.symbol, {
    error: () => i18n.t('validation:passwordRules.symbol'),
  });

export const hasPasswordLowercase = (password: string) =>
  PASSWORD_PATTERNS.lowercase.test(password);

export const hasPasswordUppercase = (password: string) =>
  PASSWORD_PATTERNS.uppercase.test(password);

export const hasPasswordNumber = (password: string) =>
  PASSWORD_PATTERNS.number.test(password);

export const hasPasswordSymbol = (password: string) =>
  PASSWORD_PATTERNS.symbol.test(password);
