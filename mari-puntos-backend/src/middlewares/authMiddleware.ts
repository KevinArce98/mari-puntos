import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { PartnerLink, PartnerLinkStatus } from '../entities/PartnerLink';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  user?: User;
  clerkId?: string;
}

/**
 * Verify and decode a Clerk JWT token.
 * Returns the decoded payload or throws if invalid.
 */
function verifyClerkJWT(token: string): jwt.JwtPayload {
  const options = { algorithms: ['RS256'] as jwt.Algorithm[] };
  const decoded = jwt.verify(token, config.clerk.publicKey, options) as jwt.JwtPayload;

  if (!decoded.exp || !decoded.nbf) {
    throw Object.assign(new Error('Missing token claims'), { name: 'InvalidClaimsError' });
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp < currentTime) {
    throw Object.assign(new Error('Token expired'), { name: 'TokenExpiredError' });
  }
  if (decoded.nbf > currentTime) {
    throw Object.assign(new Error('Token not yet valid'), { name: 'TokenNotBeforeError' });
  }

  return decoded;
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

    let decoded: jwt.JwtPayload;
    try {
      decoded = verifyClerkJWT(token);
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

    // Find user in database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { clerkId } });

    if (!user) {
      sendError(res, 'Usuario no encontrado. Por favor crea un perfil primero.', 404);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'La cuenta está desactivada', 403);
      return;
    }

    // Attach user context to request
    req.userId = user.id;
    req.clerkId = clerkId;
    req.user = user;

    logger.debug({ message: 'User authenticated successfully', userId: user.id, clerkId });

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

    let decoded: jwt.JwtPayload;
    try {
      decoded = verifyClerkJWT(token);
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
