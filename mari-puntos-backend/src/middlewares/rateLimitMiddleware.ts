import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (in production, consider using Redis)
const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  },
  5 * 60 * 1000
);

/**
 * Simple rate limiting middleware
 * Limits requests per IP address
 *
 * Development: 1000 requests per 15 minutes
 * Production: 100 requests per 15 minutes
 */
export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip rate limiting in test environment
  if (config.isTest) {
    next();
    return;
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = config.isDevelopment ? 1000 : 100;

  // Initialize or get existing entry
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    next();
    return;
  }

  // Increment counter
  store[ip].count++;

  // Check if limit exceeded
  if (store[ip].count > maxRequests) {
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes. Por favor intenta más tarde.',
      retryAfter: Math.ceil((store[ip].resetTime - now) / 1000),
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - store[ip].count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(store[ip].resetTime).toISOString());

  next();
};
