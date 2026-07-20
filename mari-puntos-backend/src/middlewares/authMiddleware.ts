import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/express';
import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import { LRUCache } from 'lru-cache';
import { config } from '../config/env';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { UsersService } from '../services/users.service';

/** LRU cache: clerkId → { userId, isActive }. TTL 5 min. Max 500 entries. */
const userCache = new LRUCache<string, { userId: string; isActive: boolean }>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

const usersService = new UsersService();

export interface AuthRequest extends Request {
  userId?: string;
  user?: User;
  clerkId?: string;
}

async function verifyClerkJWT(token: string) {
  let payload: Awaited<ReturnType<typeof verifyToken>>;
  try {
    payload = await verifyToken(token, {
      jwtKey: config.clerk.publicKey,
      clockSkewInMs: 5000,
    });
  } catch (err) {
    const reason = (err as { reason?: string } | undefined)?.reason;
    throw Object.assign(
      new Error(err instanceof Error ? err.message : 'Token verification failed'),
      {
        name:
          reason === 'token-expired'
            ? 'TokenExpiredError'
            : reason === 'token-not-active-yet'
              ? 'TokenNotBeforeError'
              : 'JsonWebTokenError',
      }
    );
  }

  if (payload.iss !== config.clerk.issuer) {
    throw Object.assign(new Error('Issuer mismatch'), { name: 'JsonWebTokenError' });
  }

  return payload;
}

/**
 * Authentication middleware
 * Validates Clerk JWT token and attaches user to request
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Autenticación requerida', 401);
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    let decoded: Awaited<ReturnType<typeof verifyClerkJWT>>;
    try {
      decoded = await verifyClerkJWT(token);
    } catch (jwtError: unknown) {
      logger.error({ err: jwtError }, 'JWT verification failed');
      const errName = jwtError instanceof Error ? jwtError.name : '';
      if (errName === 'TokenExpiredError') {
        sendError(res, 'El token ha expirado', 401);
      } else if (errName === 'TokenNotBeforeError') {
        sendError(res, 'El token aún no es válido', 401);
      } else {
        sendError(res, 'Token inválido o expirado', 401);
      }
      return;
    }

    const clerkId = decoded.sub as string;

    let cached = userCache.get(clerkId);
    if (!cached) {
      const userRepository = AppDataSource.getRepository(User);
      let user = await userRepository.findOne({ where: { clerkId } });

      if (!user) {
        try {
          user = await usersService.findOrCreateByClerkId(clerkId);
          logger.info({ clerkId, userId: user.id }, 'JIT-provisioned user on first request');
        } catch (provisionError) {
          logger.error(
            { err: provisionError, clerkId },
            'JIT provisioning failed for authenticated Clerk session'
          );
          sendError(res, 'No se pudo preparar tu cuenta. Intenta de nuevo.', 500);
          return;
        }
      }

      cached = { userId: user.id, isActive: user.isActive };
      userCache.set(clerkId, cached);
      req.user = user;
    }

    if (!cached.isActive) {
      userCache.delete(clerkId); // Evict deactivated users immediately
      sendError(res, 'La cuenta está desactivada', 403);
      return;
    }

    // Attach user context to request
    req.userId = cached.userId;
    req.clerkId = clerkId;

    logger.debug({ message: 'User authenticated successfully', userId: cached.userId, clerkId });

    next();
  } catch (error) {
    logger.error({ err: error }, 'Auth middleware error');
    sendError(res, 'Autenticación fallida', 401);
  }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token - continue without user context
    next();
    return;
  }

  // Token provided - validate it
  return authMiddleware(req, res, next);
};

/**
 * Middleware to require an active linked partner.
 * Must be used after authMiddleware.
 */
export const requirePartner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.userId) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  const partnerLinkRepository = AppDataSource.getRepository(PartnerLink);
  const partnerLink = await partnerLinkRepository.findOne({
    where: [
      { user1Id: req.userId, status: PartnerLinkStatus.ACTIVE },
      { user2Id: req.userId, status: PartnerLinkStatus.ACTIVE },
    ],
  });

  if (!partnerLink) {
    sendError(res, 'No tienes una pareja vinculada. Por favor vincula a tu pareja primero.', 400);
    return;
  }

  next();
};

/**
 * Auth middleware for profile creation.
 * Requires a valid Clerk JWT. Extracts clerkId from the token only — never from the request body.
 * Used for POST /users/profile endpoint.
 */
export const clerkOnlyAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Autenticación requerida', 401);
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    let decoded: Awaited<ReturnType<typeof verifyClerkJWT>>;
    try {
      decoded = await verifyClerkJWT(token);
      logger.debug('Token verified successfully for profile creation');
    } catch (jwtError: unknown) {
      logger.error({ err: jwtError }, 'JWT verification failed (clerk-only)');
      const errName = jwtError instanceof Error ? jwtError.name : '';
      if (errName === 'TokenExpiredError') {
        sendError(res, 'El token ha expirado', 401);
      } else if (errName === 'TokenNotBeforeError') {
        sendError(res, 'El token aún no es válido', 401);
      } else {
        sendError(res, 'Token inválido o expirado', 401);
      }
      return;
    }

    const clerkId = decoded.sub as string;
    logger.debug({ message: 'ClerkId extracted from token for profile creation' });

    req.clerkId = clerkId;
    next();
  } catch (error) {
    logger.error({ err: error }, 'Clerk auth middleware error');
    sendError(res, 'Autenticación fallida', 401);
  }
};
