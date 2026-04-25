import crypto from 'crypto';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { config } from '../config/env';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const TIMEZONE = 'America/Costa_Rica';

export const getNowUTC6 = (): Date => {
  return dayjs().tz(TIMEZONE).toDate();
};

export const toUTC6 = (date: Date): Date => {
  return dayjs(date).tz(TIMEZONE).toDate();
};

export const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < config.app.partnerCodeLength; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  return code;
};

export const calculateLevel = (totalPoints: number): number => {
  return Math.floor(totalPoints / config.app.pointsPerLevel) + 1;
};

export const calculatePointsInCurrentLevel = (totalPoints: number): number => {
  return totalPoints % config.app.pointsPerLevel;
};

export const calculatePointsForNextLevel = (totalPoints: number): number => {
  const pointsInCurrentLevel = calculatePointsInCurrentLevel(totalPoints);
  return config.app.pointsPerLevel - pointsInCurrentLevel;
};

export const calculateLevelProgress = (totalPoints: number): number => {
  const pointsInCurrentLevel = calculatePointsInCurrentLevel(totalPoints);
  return Math.floor((pointsInCurrentLevel / config.app.pointsPerLevel) * 100);
};

export const formatDate = (date: Date): string => {
  return dayjs(date).tz(TIMEZONE).toISOString();
};

export const isExpired = (date: Date): boolean => {
  return dayjs().tz(TIMEZONE).isAfter(dayjs(date));
};

export const addHours = (date: Date, hours: number): Date => {
  return dayjs(date).add(hours, 'hour').toDate();
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const getISOWeekId = (date?: Date): string => {
  const d = dayjs(date ?? new Date()).tz(TIMEZONE);
  const year: number = d.isoWeekYear();
  const week: number = d.isoWeek();
  return `${year}-W${String(week).padStart(2, '0')}`;
};

export const getPreviousWeekId = (weekId: string): string => {
  const [yearStr, weekPart] = weekId.split('-W');
  let year = parseInt(yearStr, 10);
  let week = parseInt(weekPart, 10);

  if (week > 1) {
    return `${year}-W${String(week - 1).padStart(2, '0')}`;
  }

  // Week 1 → last ISO week of previous year. Dec 28 is always in the final ISO week.
  year -= 1;
  week = dayjs(new Date(year, 11, 28))
    .tz(TIMEZONE)
    .isoWeek();
  return `${year}-W${String(week).padStart(2, '0')}`;
};
