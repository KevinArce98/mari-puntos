/**
 * UTC-6 timezone utilities using dayjs for consistent date handling across the app
 */
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('es');

// Fallback timezone for the product's primary market (Costa Rica, UTC-6),
// used when the device timezone cannot be resolved.
const DEFAULT_TIMEZONE = 'America/Costa_Rica';

/**
 * Resolve the timezone to use for all date formatting.
 * Prefers the device's own timezone so dates are correct for users anywhere,
 * falling back to the product default if the runtime can't report one.
 */
const resolveTimezone = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

const TIMEZONE = resolveTimezone();

/**
 * Get current date/time in UTC-6 timezone
 */
export const getNowUTC6 = (): Date => {
  return dayjs().tz(TIMEZONE).toDate();
};

/**
 * Convert any date to UTC-6 timezone
 */
export const toUTC6 = (date: Date): Date => {
  return dayjs(date).tz(TIMEZONE).toDate();
};

/**
 * Parse a date string and adjust to UTC-6
 */
export const parseToUTC6 = (dateString: string): Date => {
  return dayjs(dateString).tz(TIMEZONE).toDate();
};

/**
 * Get time difference in seconds between two dates
 */
export const getTimeDiffInSeconds = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'second');
};

/**
 * Get time difference in minutes between two dates
 */
export const getTimeDiffInMinutes = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'minute');
};

/**
 * Get time difference in hours between two dates
 */
export const getTimeDiffInHours = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'hour');
};

/**
 * Get time difference in days between two dates
 */
export const getTimeDiffInDays = (date1: Date, date2: Date): number => {
  return dayjs(date2).diff(dayjs(date1), 'day');
};

/**
 * Format date relative to now (e.g., "hace 5 minutos", "hace 2 horas")
 * Uses UTC-6 timezone
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = dayjs(dateString).tz(TIMEZONE);
  const now = dayjs().tz(TIMEZONE);

  const diffInSeconds = now.diff(date, 'second');

  if (diffInSeconds < 60) {
    return 'Ahora mismo';
  }

  const diffInMinutes = now.diff(date, 'minute');
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = now.diff(date, 'hour');
  if (diffInHours < 24) {
    return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = now.diff(date, 'day');
  if (diffInDays < 7) {
    return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }

  // For dates older than a week
  if (date.year() === now.year()) {
    return date.format('D MMM');
  }
  return date.format('D MMM YYYY');
};

/**
 * Format date to Costa Rica locale with time
 */
export const formatDateWithTime = (dateString: string): string => {
  return dayjs(dateString).tz(TIMEZONE).format('D MMM YYYY, HH:mm');
};

/**
 * Format date to Costa Rica locale (date only)
 */
export const formatDateOnly = (dateString: string): string => {
  return dayjs(dateString).tz(TIMEZONE).format('DD/MM/YYYY');
};

/**
 * Create a date in UTC-6 timezone from date and time components
 */
export const createUTC6DateTime = (date: Date, time: Date): Date => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const timeStr = dayjs(time).format('HH:mm:ss');
  return dayjs.tz(`${dateStr} ${timeStr}`, TIMEZONE).toDate();
};
