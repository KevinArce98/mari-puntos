import { NextFunction, Request, Response } from 'express';

import { config } from '../config/env';
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

/**
 * Extract a stable rate-limit key from the request.
 * Prefers the Clerk user ID (decoded from JWT without full verification)
 * so each user has their own bucket. Falls back to real IP from Cloudflare
 * headers to avoid all users sharing the Docker internal IP.
 */
function getRateLimitKey(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = JSON.parse(
        Buffer.from(authHeader.split('.')[1], 'base64url').toString()
      );
      if (payload.sub) return `user:${payload.sub}`;
    } catch {
      // fall through
    }
  }

  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') return `ip:${cfIp}`;

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      .split(',')[0]
      .trim();
    return `ip:${first}`;
  }

  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

/**
 * Rate limiting middleware — keyed per user (JWT sub) or real IP.
 *
 * Development : 1000 req / 15 min
 * Production  : 300 req / 15 min
 */
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
    sendError(res, 'Demasiadas solicitudes. Por favor intenta más tarde.', 429);
    return;
  }

  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

  next();
};
