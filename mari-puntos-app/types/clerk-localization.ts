import i18n from '@/i18n';

export const handleClerkErrors = (errors: unknown[]): string => {
  if (!Array.isArray(errors) || errors.length === 0) {
    return i18n.t('clerk:unexpected');
  }

  const error = errors[0] as {
    code?: string;
    message?: string;
    longMessage?: string;
    meta?: Record<string, unknown>;
  };

  const meta = error.meta ?? {};
  const emailAddresses = meta.emailAddresses;
  const params: Record<string, unknown> = {
    ...meta,
    email: Array.isArray(emailAddresses) ? emailAddresses[0] : emailAddresses,
  };

  const fallback = error.longMessage || error.message || i18n.t('clerk:retry');

  if (!error.code) return fallback;

  const translated = i18n.t(`clerk:${error.code}`, {
    ...params,
    defaultValue: '',
  });

  if (!translated || /\{\{.+?\}\}/.test(translated)) return fallback;
  return translated;
};
