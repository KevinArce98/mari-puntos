// filepath: /Users/kevinarias/Projects/mari-puntos-backend/src/utils/response.ts

/**
 * Standardized API Response Helpers
 * All responses MUST use these helpers to ensure consistency with frontend
 */

import { Response } from 'express';
import { PaginationMeta } from '../shared/dtos';

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

/**
 * Send a standard success response
 * Format: { success: true, data: T, message?: string }
 */
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

/**
 * Send a success response for resource creation (201)
 */
export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

/**
 * Send a paginated success response
 * Format: { success: true, data: T[], pagination: {...} }
 */
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

/**
 * Create pagination meta object
 */
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

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * Send an error response
 * Format: { success: false, error: string, details?: { field, message }[] }
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  details?: { field: string; message: string }[]
): void {
  const response: { success: false; error: string; details?: { field: string; message: string }[] } = {
    success: false,
    error,
  };

  if (details && details.length > 0) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Send a 400 Bad Request error
 */
export function sendBadRequest(
  res: Response,
  error: string,
  details?: { field: string; message: string }[]
): void {
  sendError(res, error, 400, details);
}

/**
 * Send a 401 Unauthorized error
 */
export function sendUnauthorized(res: Response, error: string = 'Unauthorized'): void {
  sendError(res, error, 401);
}

/**
 * Send a 403 Forbidden error
 */
export function sendForbidden(res: Response, error: string = 'Forbidden'): void {
  sendError(res, error, 403);
}

/**
 * Send a 404 Not Found error
 */
export function sendNotFound(res: Response, error: string = 'Resource not found'): void {
  sendError(res, error, 404);
}

/**
 * Send a 409 Conflict error
 */
export function sendConflict(res: Response, error: string): void {
  sendError(res, error, 409);
}

/**
 * Send a 500 Internal Server Error
 */
export function sendInternalError(
  res: Response,
  error: string = 'Internal server error'
): void {
  sendError(res, error, 500);
}
