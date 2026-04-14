import { z } from 'zod';

export const PASSWORD_PATTERNS = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  symbol: /[^a-zA-Z0-9\s]/,
};

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña debe tener máximo 100 caracteres')
  .regex(
    PASSWORD_PATTERNS.lowercase,
    'La contraseña debe contener al menos una letra minúscula'
  )
  .regex(
    PASSWORD_PATTERNS.uppercase,
    'La contraseña debe contener al menos una letra mayúscula'
  )
  .regex(PASSWORD_PATTERNS.number, 'La contraseña debe contener al menos un número')
  .regex(PASSWORD_PATTERNS.symbol, 'La contraseña debe contener al menos un símbolo');

export const hasPasswordLowercase = (password: string) =>
  PASSWORD_PATTERNS.lowercase.test(password);

export const hasPasswordUppercase = (password: string) =>
  PASSWORD_PATTERNS.uppercase.test(password);

export const hasPasswordNumber = (password: string) =>
  PASSWORD_PATTERNS.number.test(password);

export const hasPasswordSymbol = (password: string) =>
  PASSWORD_PATTERNS.symbol.test(password);
