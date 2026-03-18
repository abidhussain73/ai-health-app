import { NextFunction, Request, Response } from 'express';
import { verifyAccess } from '../config/jwt';
import { fail } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        plan: string;
        email: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    fail(res, 401, 'No token provided');
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyAccess(token);
    req.user = {
      id: payload.userId,
      role: payload.role,
      plan: payload.plan,
      email: payload.email
    };
    next();
  } catch (error) {
    const message = error instanceof Error && error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    fail(res, 401, message);
  }
};
