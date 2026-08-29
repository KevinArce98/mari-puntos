import type { Lang } from '@/i18n/ui';

export const APP_STORE_URL = 'https://apps.apple.com/app/id6758923865';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.maripuntos.app';

export const screenshotPath = (name: string, lang: Lang) =>
  `/${name}${lang === 'en' ? '-en' : ''}.png`;
