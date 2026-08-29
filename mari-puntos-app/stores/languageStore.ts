import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import i18n, {
  AppLocale,
  LOCALE_STORAGE_KEY,
  getDeviceLocale,
  isSupportedLocale,
  localeReady,
} from '@/i18n';
import { userService } from '@/services';
import logger from '@/utils/logger';

import { useUserStore } from './userStore';

export type LanguagePreference = 'system' | AppLocale;

interface LanguageState {
  preference: LanguagePreference;
  locale: AppLocale;
  hydrate: () => Promise<void>;
  setPreference: (preference: LanguagePreference) => Promise<void>;
  reconcileWithBackend: (backendLocale: string | null | undefined) => void;
}

const resolveEffective = (preference: LanguagePreference): AppLocale =>
  preference === 'system' ? getDeviceLocale() : preference;

const currentLocale = (): AppLocale =>
  isSupportedLocale(i18n.language) ? i18n.language : getDeviceLocale();

const syncToBackend = (locale: AppLocale): void => {
  if (!useUserStore.getState().user?.id) return;
  userService
    .updateProfile({ locale })
    .catch((error) => logger.warn('Failed to sync language to backend', error as Error));
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  preference: 'system',
  locale: currentLocale(),

  hydrate: async () => {
    await localeReady;
    const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY).catch(() => null);
    set({
      preference: isSupportedLocale(stored) ? stored : 'system',
      locale: currentLocale(),
    });
  },

  setPreference: async (preference) => {
    const next = resolveEffective(preference);
    set({ preference, locale: next });

    try {
      if (preference === 'system') {
        await AsyncStorage.removeItem(LOCALE_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, preference);
      }
    } catch (error) {
      logger.warn('Failed to persist language preference', error as Error);
    }

    if (i18n.language !== next) {
      await i18n.changeLanguage(next);
    }
    syncToBackend(next);
  },

  reconcileWithBackend: (backendLocale) => {
    if (get().preference !== 'system') return;

    if (isSupportedLocale(backendLocale)) {
      if (backendLocale === get().locale) return;
      set({ preference: backendLocale, locale: backendLocale });
      AsyncStorage.setItem(LOCALE_STORAGE_KEY, backendLocale).catch(() => {});
      i18n.changeLanguage(backendLocale).catch(() => {});
      return;
    }

    syncToBackend(get().locale);
  },
}));

i18n.on('languageChanged', (lng: string) => {
  if (isSupportedLocale(lng) && lng !== useLanguageStore.getState().locale) {
    useLanguageStore.setState({ locale: lng });
  }
});
