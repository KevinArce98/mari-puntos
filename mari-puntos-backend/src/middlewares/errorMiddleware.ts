import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/env';
import { sendError, sendNotFound, sendInternalError } from '../utils/response';
import { ErrorCode, ErrorCodeToHttpStatus } from '../shared/constants';
import { logger } from '../utils/logger';

/**
 * Custom application error
 * Supports both ErrorCode-based and HTTP status code-based instantiation
 */
export class AppError extends Error {
  public statusCode: number;
  public code?: ErrorCode;

  constructor(codeOrStatus: ErrorCode | number, message: string, statusCode?: number) {
    super(message);

    // Check if first argument is an ErrorCode or HTTP status number
    if (typeof codeOrStatus === 'string' && codeOrStatus in ErrorCode) {
      // ErrorCode-based construction
      this.code = codeOrStatus as ErrorCode;
      this.statusCode = statusCode || ErrorCodeToHttpStatus[this.code] || 500;
    } else if (typeof codeOrStatus === 'number') {
      // HTTP status-based construction (legacy support)
      this.statusCode = codeOrStatus;
    } else {
      this.statusCode = 500;
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware
 * Converts all errors to standardized API error format
 */
export const errorMiddleware = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const logPayload = config.isDevelopment
    ? { err }
    : { name: err.name, message: err.message };

  if (err instanceof AppError && err.statusCode < 500) {
    logger.warn(logPayload, 'Client error');
  } else {
    logger.error(logPayload, 'Unhandled error');
  }

  // Zod validation errors - format as { success: false, error: string, details: [] }
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    sendError(res, 'Error de validación', 400, details);
    return;
  }

  // Custom app errors with error codes
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Database errors
  if (err.name === 'QueryFailedError') {
    const message = config.isDevelopment
      ? `Error de base de datos: ${err.message}`
      : 'Error de base de datos';
    sendError(res, message, 500);
    return;
  }

  // TypeORM EntityNotFoundError
  if (err.name === 'EntityNotFoundError') {
    sendNotFound(res, 'Recurso no encontrado');
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(res, 'Autenticación fallida', 401);
    return;
  }

  // Default error - don't leak internal details in production
  const message = config.isDevelopment ? err.message : 'Error interno del servidor';
  sendInternalError(res, message);
};

/**
 * 404 Not Found middleware for unknown routes
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendNotFound(res, `Ruta no encontrada: ${req.method} ${req.path}`);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export const createError = {
  unauthorized: (message = 'No autorizado') =>
    new AppError(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message = 'Prohibido') => new AppError(ErrorCode.FORBIDDEN, message),

  notFound: (resource = 'Recurso') =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} no encontrado`),

  conflict: (message: string) => new AppError(ErrorCode.CONFLICT, message),

  validation: (message: string) => new AppError(ErrorCode.VALIDATION_ERROR, message),

  insufficientPoints: () =>
    new AppError(ErrorCode.INSUFFICIENT_POINTS, 'Puntos insuficientes'),

  partnerNotLinked: () =>
    new AppError(ErrorCode.PARTNER_NOT_LINKED, 'No tienes pareja vinculada'),

  partnerAlreadyLinked: () =>
    new AppError(ErrorCode.PARTNER_ALREADY_LINKED, 'Ya tienes una pareja vinculada'),

  invalidLinkCode: () =>
    new AppError(ErrorCode.INVALID_LINK_CODE, 'Código de enlace inválido'),

  linkCodeExpired: () =>
    new AppError(ErrorCode.LINK_CODE_EXPIRED, 'El código de enlace ha expirado'),

  actionAlreadyEvaluated: () =>
    new AppError(ErrorCode.ACTION_ALREADY_EVALUATED, 'La acción ya ha sido evaluada'),

  permissionAlreadyResponded: () =>
    new AppError(
      ErrorCode.PERMISSION_ALREADY_RESPONDED,
      'El permiso ya ha sido respondido'
    ),

  cannotEvaluateOwnAction: () =>
    new AppError(
      ErrorCode.CANNOT_EVALUATE_OWN_ACTION,
      'No puedes evaluar tu propia acción'
    ),

  cannotRespondOwnPermission: () =>
    new AppError(
      ErrorCode.CANNOT_RESPOND_OWN_PERMISSION,
      'No puedes responder a tu propia solicitud de permiso'
    ),

  rewardNotAvailable: () =>
    new AppError(ErrorCode.REWARD_NOT_AVAILABLE, 'La recompensa no está disponible'),

  levelRequirementNotMet: (required: number) =>
    new AppError(ErrorCode.LEVEL_REQUIREMENT_NOT_MET, `Se requiere nivel ${required}`),

  roleRequired: (role: string) =>
    new AppError(ErrorCode.ROLE_REQUIRED, `Esta acción requiere el rol ${role}`),
};
