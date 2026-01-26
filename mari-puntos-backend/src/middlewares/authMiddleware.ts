import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
  user?: User;
  clerkId?: string;
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
    const options = { algorithms: ['RS256'] as jwt.Algorithm[] };
    
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, config.clerk.publicKey, options) as jwt.JwtPayload;
    } catch (jwtError) {
      sendError(res, 'Token inválido o expirado', 401);
      return;
    }

    if (!decoded.exp || !decoded.nbf) {
      sendError(res, 'Claims de token inválidos', 401);
      return;
    }

    // Validate token expiration and not-before claims
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      sendError(res, 'El token ha expirado', 401);
      return;
    }
    if (decoded.nbf > currentTime) {
      sendError(res, 'El token aún no es válido', 401);
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

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
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
 * Middleware to require a linked partner
 * Must be used after authMiddleware
 */
export const requirePartner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  // Check if user has a partner linked
  // This is a simplified check - the actual partner link check should be done in service layer
  if (!req.user.partnerCode) {
    sendError(res, 'No partner linked. Please link with a partner first.', 400);
    return;
  }

  next();
};
