import i18next from 'i18next';

import { AchievementType } from '../entities/Achievement';
import en from './locales/en';
import es from './locales/es';

export type BackendLocale = 'es' | 'en';

const FALLBACK_LOCALE: BackendLocale = 'es';

void i18next.init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: FALLBACK_LOCALE,
  fallbackLng: FALLBACK_LOCALE,
  interpolation: { escapeValue: false },
});

export function normalizeLocale(value: string | null | undefined): BackendLocale {
  return value === 'en' ? 'en' : 'es';
}

export function getRequestLocale(req: {
  headers: { 'accept-language'?: string | string[] };
}): BackendLocale {
  const header = req.headers['accept-language'];
  const raw = Array.isArray(header) ? header[0] : header;
  const primary = raw?.split(',')[0]?.trim().split(';')[0]?.split('-')[0];
  return normalizeLocale(primary);
}

export function translate(
  key: string,
  locale: string | null | undefined,
  params?: Record<string, unknown>
): string {
  return i18next.getFixedT(normalizeLocale(locale))(key, { ...params });
}

export function getAchievementCopy(
  type: AchievementType,
  value: number,
  locale: string | null | undefined
): { title: string; description: string } {
  const t = i18next.getFixedT(normalizeLocale(locale));

  switch (type) {
    case AchievementType.POINTS_MILESTONE:
      return {
        title: t('achievements.pointsTitle', { value }),
        description: t('achievements.pointsDesc', { value }),
      };
    case AchievementType.LEVEL_MILESTONE:
      return {
        title: t('achievements.levelTitle', { value }),
        description: t('achievements.levelDesc', { value }),
      };
    case AchievementType.ACTIONS_COMPLETED:
      return {
        title: t('achievements.actionsTitle', { count: value }),
        description: t('achievements.actionsDesc', { count: value }),
      };
    case AchievementType.PERMISSIONS_GRANTED:
      return {
        title: t('achievements.permissionsTitle', { count: value }),
        description: t('achievements.permissionsDesc', { count: value }),
      };
    case AchievementType.STREAK:
      return {
        title: t('achievements.streakTitle', { count: value }),
        description: t('achievements.streakDesc', { count: value }),
      };
    case AchievementType.SPECIAL:
      return {
        title: t('achievements.specialTitle', { value }),
        description: t('achievements.specialDesc', { value }),
      };
  }
}
