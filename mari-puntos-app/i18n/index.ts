import { getLocales } from 'expo-localization';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { setDayjsLocale } from '@/utils/dateUtils';
import logger from '@/utils/logger';

import en from './locales/en';
import es from './locales/es';

export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'es';
export const LOCALE_STORAGE_KEY = '@maripuntos/locale';

export const NAMESPACES = [
  'common',
  'navigation',
  'auth',
  'clerk',
  'home',
  'duel',
  'inbox',
  'profile',
  'linkPartner',
  'permissions',
  'actions',
  'achievements',
  'history',
  'modals',
  'icons',
  'validation',
  'notifications',
  'errors',
] as const;

export function isSupportedLocale(value: unknown): value is AppLocale {
  return (
    typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function getDeviceLocale(): AppLocale {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return isSupportedLocale(code) ? code : DEFAULT_LOCALE;
}

const resources = { es: { ...es }, en: { ...en } } as const;

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLocale(),
  fallbackLng: DEFAULT_LOCALE,
  ns: [...NAMESPACES],
  defaultNS: 'common',
  returnNull: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

setDayjsLocale(i18n.language);
i18n.on('languageChanged', setDayjsLocale);

export const localeReady: Promise<void> = AsyncStorage.getItem(LOCALE_STORAGE_KEY)
  .then((stored) => {
    if (isSupportedLocale(stored) && stored !== i18n.language) {
      return i18n.changeLanguage(stored);
    }
  })
  .then(() => undefined)
  .catch((error) => {
    logger.warn('Failed to load stored language override', error as Error);
  });

export default i18n;
