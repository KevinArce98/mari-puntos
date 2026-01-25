import crypto from 'crypto';
import { config } from '../config/env';

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
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Check if date is expired
 */
export const isExpired = (date: Date): boolean => {
  return new Date() > date;
};

/**
 * Add hours to date
 */
export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
