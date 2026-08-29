import { verifyToken } from '@clerk/express';
import { NextFunction, Request, Response } from 'express';
import { LRUCache } from 'lru-cache';

import { AppDataSource } from '../config/db';
import { config } from '../config/env';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import { User } from '../entities/User';
import { getRequestLocale, translate } from '../i18n';
import { UsersService } from '../services/users.service';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

const userCache = new LRUCache<string, { userId: string; isActive: boolean }>({
  max: 500,
  ttl: 1000 * 60 * 5,
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

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, translate('errors.auth.required', getRequestLocale(req)), 401);
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    let decoded: Awaited<ReturnType<typeof verifyClerkJWT>>;
    try {
      decoded = await verifyClerkJWT(token);
    } catch (jwtError: unknown) {
      logger.error({ err: jwtError }, 'JWT verification failed');
      const errName = jwtError instanceof Error ? jwtError.name : '';
      const locale = getRequestLocale(req);
      if (errName === 'TokenExpiredError') {
        sendError(res, translate('errors.auth.tokenExpired', locale), 401);
      } else if (errName === 'TokenNotBeforeError') {
        sendError(res, translate('errors.auth.tokenNotYetValid', locale), 401);
      } else {
        sendError(res, translate('errors.auth.invalidToken', locale), 401);
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
          logger.info(
            { clerkId, userId: user.id },
            'JIT-provisioned user on first request'
          );
        } catch (provisionError) {
          logger.error(
            { err: provisionError, clerkId },
            'JIT provisioning failed for authenticated Clerk session'
          );
          sendError(
            res,
            translate('errors.auth.provisioningFailed', getRequestLocale(req)),
            500
          );
          return;
        }
      }

      cached = { userId: user.id, isActive: user.isActive };
      userCache.set(clerkId, cached);
      req.user = user;
    }

    if (!cached.isActive) {
      userCache.delete(clerkId);
      sendError(
        res,
        translate('errors.auth.accountDisabled', getRequestLocale(req)),
        403
      );
      return;
    }

    req.userId = cached.userId;
    req.clerkId = clerkId;

    logger.debug({
      message: 'User authenticated successfully',
      userId: cached.userId,
      clerkId,
    });

    next();
  } catch (error) {
    logger.error({ err: error }, 'Auth middleware error');
    sendError(res, translate('errors.auth.failed', getRequestLocale(req)), 401);
  }
};

export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  return authMiddleware(req, res, next);
};

export const requirePartner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.userId) {
    sendError(res, translate('errors.auth.required', getRequestLocale(req)), 401);
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
    sendError(res, translate('errors.auth.partnerRequired', getRequestLocale(req)), 400);
    return;
  }

  next();
};

export const clerkOnlyAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, translate('errors.auth.required', getRequestLocale(req)), 401);
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
      const locale = getRequestLocale(req);
      if (errName === 'TokenExpiredError') {
        sendError(res, translate('errors.auth.tokenExpired', locale), 401);
      } else if (errName === 'TokenNotBeforeError') {
        sendError(res, translate('errors.auth.tokenNotYetValid', locale), 401);
      } else {
        sendError(res, translate('errors.auth.invalidToken', locale), 401);
      }
      return;
    }

    const clerkId = decoded.sub as string;
    logger.debug({ message: 'ClerkId extracted from token for profile creation' });

    req.clerkId = clerkId;
    next();
  } catch (error) {
    logger.error({ err: error }, 'Clerk auth middleware error');
    sendError(res, translate('errors.auth.failed', getRequestLocale(req)), 401);
  }
};
