import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/env';
import { sendError, sendNotFound, sendInternalError } from '../utils/response';
import { ErrorCode, ErrorCodeToHttpStatus } from '../shared/constants';

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
  console.error('Error:', err);

  // Zod validation errors - format as { success: false, error: string, details: [] }
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    
    sendError(res, 'Validation error', 400, details);
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
      ? `Database error: ${err.message}` 
      : 'Database error';
    sendError(res, message, 500);
    return;
  }

  // TypeORM EntityNotFoundError
  if (err.name === 'EntityNotFoundError') {
    sendNotFound(res, 'Resource not found');
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(res, 'Authentication failed', 401);
    return;
  }

  // Default error - don't leak internal details in production
  const message = config.isDevelopment 
    ? err.message 
    : 'Internal server error';
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
  sendNotFound(res, `Route not found: ${req.method} ${req.path}`);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export const createError = {
  unauthorized: (message = 'Unauthorized') => 
    new AppError(ErrorCode.UNAUTHORIZED, message),
  
  forbidden: (message = 'Forbidden') => 
    new AppError(ErrorCode.FORBIDDEN, message),
  
  notFound: (resource = 'Resource') => 
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`),
  
  conflict: (message: string) => 
    new AppError(ErrorCode.CONFLICT, message),
  
  validation: (message: string) => 
    new AppError(ErrorCode.VALIDATION_ERROR, message),
  
  insufficientPoints: () => 
    new AppError(ErrorCode.INSUFFICIENT_POINTS, 'Insufficient points'),
  
  partnerNotLinked: () => 
    new AppError(ErrorCode.PARTNER_NOT_LINKED, 'No partner linked'),
  
  partnerAlreadyLinked: () => 
    new AppError(ErrorCode.PARTNER_ALREADY_LINKED, 'Partner already linked'),
  
  invalidLinkCode: () => 
    new AppError(ErrorCode.INVALID_LINK_CODE, 'Invalid link code'),
  
  linkCodeExpired: () => 
    new AppError(ErrorCode.LINK_CODE_EXPIRED, 'Link code has expired'),
  
  actionAlreadyEvaluated: () => 
    new AppError(ErrorCode.ACTION_ALREADY_EVALUATED, 'Action has already been evaluated'),
  
  permissionAlreadyResponded: () => 
    new AppError(ErrorCode.PERMISSION_ALREADY_RESPONDED, 'Permission has already been responded to'),
  
  cannotEvaluateOwnAction: () => 
    new AppError(ErrorCode.CANNOT_EVALUATE_OWN_ACTION, 'Cannot evaluate your own action'),
  
  cannotRespondOwnPermission: () => 
    new AppError(ErrorCode.CANNOT_RESPOND_OWN_PERMISSION, 'Cannot respond to your own permission request'),
  
  rewardNotAvailable: () => 
    new AppError(ErrorCode.REWARD_NOT_AVAILABLE, 'Reward is not available'),
  
  levelRequirementNotMet: (required: number) => 
    new AppError(ErrorCode.LEVEL_REQUIREMENT_NOT_MET, `Level ${required} required`),
  
  roleRequired: (role: string) => 
    new AppError(ErrorCode.ROLE_REQUIRED, `This action requires ${role} role`),
};
