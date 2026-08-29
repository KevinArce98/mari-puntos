import { NextFunction, Request, Response } from 'express';

import { config } from '../config/env';
import { getRequestLocale, translate } from '../i18n';
import { sendError } from '../utils/response';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(
  () => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (entry.resetTime < now) store.delete(key);
    });
  },
  5 * 60 * 1000
);

function getClientIp(req: Request): string {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') return cfIp;

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      .split(',')[0]
      .trim();
    if (first) return first;
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
}

function getRateLimitKey(req: Request): string {
  const ip = getClientIp(req);

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = JSON.parse(
        Buffer.from(authHeader.split('.')[1], 'base64url').toString()
      );
      if (typeof payload.sub === 'string' && payload.sub) {
        return `user:${payload.sub}:ip:${ip}`;
      }
    } catch {
      void 0;
    }
  }

  return `ip:${ip}`;
}

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (config.isTest) {
    next();
    return;
  }

  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = config.isDevelopment ? 1000 : 300;

  const entry = store.get(key);
  if (!entry || entry.resetTime < now) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds.toString());
    sendError(res, translate('errors.rateLimit.tooMany', getRequestLocale(req)), 429);
    return;
  }

  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

  next();
};
