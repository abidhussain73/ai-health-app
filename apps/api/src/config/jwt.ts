import jwt from 'jsonwebtoken';
import { env } from './env';

export type AccessTokenPayload = {
  userId: string;
  role: string;
  plan: string;
  email: string;
};

export type RefreshTokenPayload = {
  userId: string;
  family: string;
};

export const signAccess = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] });
};

export const signRefresh = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn']
  });
};

export const verifyAccess = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};

export const verifyRefresh = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
