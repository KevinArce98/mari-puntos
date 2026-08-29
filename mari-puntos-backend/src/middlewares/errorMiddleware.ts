import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { config } from '../config/env';
import { getRequestLocale, translate } from '../i18n';
import { ErrorCode, ErrorCodeToHttpStatus } from '../shared/constants';
import { logger } from '../utils/logger';
import { sendError, sendInternalError, sendNotFound } from '../utils/response';

export class AppError extends Error {
  public statusCode: number;
  public code?: ErrorCode;
  public i18nKey?: string;
  public i18nParams?: Record<string, unknown>;

  constructor(
    codeOrStatus: ErrorCode | number,
    message: string,
    i18nKeyOrStatusCode?: string | number,
    i18nParams?: Record<string, unknown>
  ) {
    super(message);

    if (typeof codeOrStatus === 'string' && codeOrStatus in ErrorCode) {
      this.code = codeOrStatus as ErrorCode;
      this.statusCode =
        typeof i18nKeyOrStatusCode === 'number'
          ? i18nKeyOrStatusCode
          : ErrorCodeToHttpStatus[this.code] || 500;
    } else if (typeof codeOrStatus === 'number') {
      this.statusCode = codeOrStatus;
    } else {
      this.statusCode = 500;
    }

    if (typeof i18nKeyOrStatusCode === 'string') {
      this.i18nKey = i18nKeyOrStatusCode;
      this.i18nParams = i18nParams;
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorMiddleware = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const locale = getRequestLocale(req);
  const logPayload = config.isDevelopment
    ? { err }
    : { name: err.name, message: err.message };

  if (err instanceof AppError && err.statusCode < 500) {
    logger.warn(logPayload, 'Client error');
  } else {
    logger.error(logPayload, 'Unhandled error');
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    sendError(res, translate('errors.generic.validation', locale), 400, details);
    return;
  }

  if (err instanceof AppError) {
    const message = err.i18nKey
      ? translate(err.i18nKey, locale, err.i18nParams)
      : err.message;
    sendError(res, message, err.statusCode, undefined, err.code);
    return;
  }

  if (err.name === 'QueryFailedError') {
    const dbMessage = translate('errors.generic.database', locale);
    const message = config.isDevelopment ? `${dbMessage}: ${err.message}` : dbMessage;
    sendError(res, message, 500);
    return;
  }

  if (err.name === 'EntityNotFoundError') {
    sendNotFound(res, translate('errors.generic.notFound', locale));
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(res, translate('errors.auth.failed', locale), 401);
    return;
  }

  const message = config.isDevelopment
    ? err.message
    : translate('errors.generic.internal', locale);
  sendInternalError(res, message);
};

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const locale = getRequestLocale(req);
  sendNotFound(
    res,
    translate('errors.generic.routeNotFound', locale, {
      method: req.method,
      path: req.path,
    })
  );
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = {
  unauthorized: (message = 'No autorizado') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 'errors.generic.unauthorized'),

  forbidden: (message = 'Prohibido') =>
    new AppError(ErrorCode.FORBIDDEN, message, 'errors.generic.forbidden'),

  notFound: (resource = 'Recurso') =>
    new AppError(
      ErrorCode.NOT_FOUND,
      `${resource} no encontrado`,
      'errors.generic.resourceNotFound',
      {
        resource,
      }
    ),

  conflict: (message: string) => new AppError(ErrorCode.CONFLICT, message),

  validation: (message: string) => new AppError(ErrorCode.VALIDATION_ERROR, message),

  insufficientPoints: () =>
    new AppError(
      ErrorCode.INSUFFICIENT_POINTS,
      'Puntos insuficientes',
      'errors.points.insufficient'
    ),

  partnerNotLinked: () =>
    new AppError(
      ErrorCode.PARTNER_NOT_LINKED,
      'No tienes pareja vinculada',
      'errors.partner.notLinked'
    ),

  partnerAlreadyLinked: () =>
    new AppError(
      ErrorCode.PARTNER_ALREADY_LINKED,
      'Ya tienes una pareja vinculada',
      'errors.partner.alreadyLinked'
    ),

  invalidLinkCode: () =>
    new AppError(
      ErrorCode.INVALID_LINK_CODE,
      'Código de enlace inválido',
      'errors.partner.invalidLinkCode'
    ),

  linkCodeExpired: () =>
    new AppError(
      ErrorCode.LINK_CODE_EXPIRED,
      'El código de enlace ha expirado',
      'errors.partner.linkCodeExpired'
    ),

  actionAlreadyEvaluated: () =>
    new AppError(
      ErrorCode.ACTION_ALREADY_EVALUATED,
      'La acción ya ha sido evaluada',
      'errors.action.alreadyEvaluated'
    ),

  permissionAlreadyResponded: () =>
    new AppError(
      ErrorCode.PERMISSION_ALREADY_RESPONDED,
      'El permiso ya ha sido respondido',
      'errors.permission.alreadyResponded'
    ),

  cannotEvaluateOwnAction: () =>
    new AppError(
      ErrorCode.CANNOT_EVALUATE_OWN_ACTION,
      'No puedes evaluar tu propia acción',
      'errors.action.cannotEvaluateOwn'
    ),

  cannotRespondOwnPermission: () =>
    new AppError(
      ErrorCode.CANNOT_RESPOND_OWN_PERMISSION,
      'No puedes responder a tu propia solicitud de permiso',
      'errors.permission.cannotRespondOwn'
    ),

  rewardNotAvailable: () =>
    new AppError(
      ErrorCode.REWARD_NOT_AVAILABLE,
      'La recompensa no está disponible',
      'errors.reward.notAvailable'
    ),

  levelRequirementNotMet: (required: number) =>
    new AppError(
      ErrorCode.LEVEL_REQUIREMENT_NOT_MET,
      `Se requiere nivel ${required}`,
      'errors.points.levelRequired',
      { required }
    ),

  roleRequired: (role: string) =>
    new AppError(
      ErrorCode.ROLE_REQUIRED,
      `Esta acción requiere el rol ${role}`,
      'errors.generic.roleRequired',
      { role }
    ),
};
