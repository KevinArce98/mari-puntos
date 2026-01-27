import crypto from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { config } from '../config/env';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Costa Rica timezone (UTC-6)
const TIMEZONE = 'America/Costa_Rica';

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
 * Generate a unique partner code
 */
export const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = '';
  
  for (let i = 0; i < config.app.partnerCodeLength; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  
  return code;
};

/**
 * Calculate level from total points
 */
export const calculateLevel = (totalPoints: number): number => {
  return Math.floor(totalPoints / config.app.pointsPerLevel) + 1;
};

/**
 * Calculate points in current level
 */
export const calculatePointsInCurrentLevel = (totalPoints: number): number => {
  return totalPoints % config.app.pointsPerLevel;
};

/**
 * Calculate points needed for next level
 */
export const calculatePointsForNextLevel = (totalPoints: number): number => {
  const pointsInCurrentLevel = calculatePointsInCurrentLevel(totalPoints);
  return config.app.pointsPerLevel - pointsInCurrentLevel;
};

/**
 * Calculate level progress percentage
 */
export const calculateLevelProgress = (totalPoints: number): number => {
  const pointsInCurrentLevel = calculatePointsInCurrentLevel(totalPoints);
  return Math.floor((pointsInCurrentLevel / config.app.pointsPerLevel) * 100);
};

/**
 * Format date to ISO string in UTC-6
 */
export const formatDate = (date: Date): string => {
  return dayjs(date).tz(TIMEZONE).toISOString();
};

/**
 * Check if date is expired (using UTC-6 timezone)
 */
export const isExpired = (date: Date): boolean => {
  return dayjs().tz(TIMEZONE).isAfter(dayjs(date));
};

/**
 * Add hours to date
 */
export const addHours = (date: Date, hours: number): Date => {
  return dayjs(date).add(hours, 'hour').toDate();
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
