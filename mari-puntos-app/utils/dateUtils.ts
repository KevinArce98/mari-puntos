import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import i18n from 'i18next';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('es');

export const setDayjsLocale = (language: string): void => {
  dayjs.locale(language.startsWith('en') ? 'en' : 'es');
};

const DEFAULT_TIMEZONE = 'America/Costa_Rica';

const resolveTimezone = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

const TIMEZONE = resolveTimezone();

export const getNowUTC6 = (): Date => {
  return dayjs().tz(TIMEZONE).toDate();
};

export const toUTC6 = (date: Date): Date => {
  return dayjs(date).tz(TIMEZONE).toDate();
};

export const parseToUTC6 = (dateString: string): Date => {
  return dayjs(dateString).tz(TIMEZONE).toDate();
};

export const getTimeDiffInSeconds = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'second');
};

export const getTimeDiffInMinutes = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'minute');
};

export const getTimeDiffInHours = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'hour');
};

export const getTimeDiffInDays = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'day');
};

export const formatRelativeTime = (dateString: string): string => {
  const date = dayjs(dateString).tz(TIMEZONE);
  const now = dayjs().tz(TIMEZONE);

  const diffInSeconds = now.diff(date, 'second');

  if (diffInSeconds < 60) {
    return i18n.t('common:time.now');
  }

  const diffInMinutes = now.diff(date, 'minute');
  if (diffInMinutes < 60) {
    return i18n.t('common:time.minutesAgo', { count: diffInMinutes });
  }

  const diffInHours = now.diff(date, 'hour');
  if (diffInHours < 24) {
    return i18n.t('common:time.hoursAgo', { count: diffInHours });
  }

  const diffInDays = now.diff(date, 'day');
  if (diffInDays < 7) {
    return i18n.t('common:time.daysAgo', { count: diffInDays });
  }

  if (date.year() === now.year()) {
    return date.format('D MMM');
  }
  return date.format('D MMM YYYY');
};

export const formatDateWithTime = (dateString: string): string => {
  return dayjs(dateString).tz(TIMEZONE).format('D MMM YYYY, HH:mm');
};

export const formatDateOnly = (dateString: string): string => {
  return dayjs(dateString).tz(TIMEZONE).format('DD/MM/YYYY');
};

export const createUTC6DateTime = (date: Date, time: Date): Date => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const timeStr = dayjs(time).format('HH:mm:ss');
  return dayjs.tz(`${dateStr} ${timeStr}`, TIMEZONE).toDate();
};
