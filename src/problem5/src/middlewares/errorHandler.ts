import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../services/resourceService';
import { ApiResponse } from '../types/resource';

/**
 * 404 Not Found Middleware for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: `Cannot ${req.method} ${req.originalUrl}`,
    },
  };
  res.status(404).json(response);
}

/**
 * Centralized Global Error Handler Middleware
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    const response: ApiResponse<null> = {
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
      },
    };

    res.status(400).json(response);
    return;
  }

  // Handle Known Application Errors (NotFoundError, BadRequestError, etc.)
  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      message: err.message,
      error: {
        code: err.code,
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle SyntaxError (e.g. malformed JSON body)
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Invalid JSON payload in request body',
      error: {
        code: 'INVALID_JSON',
      },
    };

    res.status(400).json(response);
    return;
  }

  // Unexpected Server Errors (500)
  console.error('💥 Unhandled Server Error:', err);

  const response: ApiResponse<null> = {
    success: false,
    message: 'Internal Server Error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  };

  res.status(500).json(response);
}
