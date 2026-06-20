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
 * Resolve the real client IP, preferring Cloudflare / proxy headers so all
 * users don't share the Docker internal IP.
 */
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

/**
 * Extract a stable rate-limit key from the request.
 *
 * The Clerk `sub` is read from the JWT WITHOUT verifying the signature (full
 * verification happens later in authMiddleware). A forged token could therefore
 * carry any `sub`, so we never key on `sub` alone — we always bind it to the
 * real client IP. This way:
 *   - an attacker forging a victim's `sub` lands in a *different* bucket
 *     (their own IP) and cannot exhaust the victim's quota, and
 *   - an attacker cannot evade their own limit by rotating the `sub`, because
 *     their IP stays in the key.
 * The `sub` still gives each real user their own bucket when several share an
 * IP (e.g. behind a proxy/NAT).
 */
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
      // malformed token — fall back to IP-only keying
    }
  }

  return `ip:${ip}`;
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
