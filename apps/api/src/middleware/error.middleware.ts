import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      path: req.path
    }
  });
}
