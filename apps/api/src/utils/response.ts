import { Response } from 'express';

export const ok = (res: Response, data: unknown, message = 'Success'): Response => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

export const created = (res: Response, data: unknown, message = 'Created'): Response => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

export const fail = (
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown,
  code?: string
): Response => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      details
    }
  });
};
