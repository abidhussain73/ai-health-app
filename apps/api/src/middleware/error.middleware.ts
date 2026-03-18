import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

type HttpError = Error & { statusCode?: number };

export function errorMiddleware(err: HttpError, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: err.issues,
        path: req.path
      }
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      statusCode: err.statusCode ?? 500,
      path: req.path
    }
  });
}
