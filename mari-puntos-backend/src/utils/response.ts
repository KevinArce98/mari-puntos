import { Response } from 'express';

import { ErrorCode } from '../shared/constants';
import { PaginationMeta } from '../shared/dtos';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: { success: true; data: T; message?: string } = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta
): void {
  res.status(200).json({
    success: true,
    data,
    pagination,
  });
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  details?: { field: string; message: string }[],
  code?: ErrorCode
): void {
  const response: {
    success: false;
    error: string;
    details?: { field: string; message: string }[];
    code?: ErrorCode;
  } = {
    success: false,
    error,
  };

  if (details && details.length > 0) {
    response.details = details;
  }

  if (code) {
    response.code = code;
  }

  res.status(statusCode).json(response);
}

export function sendBadRequest(
  res: Response,
  error: string,
  details?: { field: string; message: string }[]
): void {
  sendError(res, error, 400, details);
}

export function sendUnauthorized(res: Response, error: string = 'Unauthorized'): void {
  sendError(res, error, 401);
}

export function sendForbidden(res: Response, error: string = 'Prohibido'): void {
  sendError(res, error, 403);
}

export function sendNotFound(
  res: Response,
  error: string = 'Recurso no encontrado'
): void {
  sendError(res, error, 404);
}

export function sendConflict(res: Response, error: string): void {
  sendError(res, error, 409);
}

export function sendInternalError(
  res: Response,
  error: string = 'Error interno del servidor'
): void {
  sendError(res, error, 500);
}
