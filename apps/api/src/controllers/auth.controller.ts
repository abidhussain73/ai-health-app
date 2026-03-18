import bcrypt from 'bcryptjs';
import { randomBytes, randomInt, createHash } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../config/redis';
import { signAccess, signRefresh, verifyRefresh } from '../config/jwt';
import { env } from '../config/env';
import { HealthProfileModel } from '../models/HealthProfile.model';
import { UserModel } from '../models/User.model';
import { sendOtpEmail, sendResetPasswordEmail } from '../services/email.service';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema
} from '../validators/auth.validator';
import { fail, ok, created } from '../utils/response';
import { logger } from '../utils/logger';

type AuthUser = {
  _id: string;
  email: string;
  role: string;
  plan: string;
  status: string;
  name: string;
};

const refreshFamilySetKey = (userId: string): string => `refresh_families:${userId}`;
const refreshFamilyKey = (family: string): string => `refresh:${family}`;

const clearLockState = async (email: string): Promise<void> => {
  await redis.del(`auth:fail:${email}`);
  await redis.del(`auth:lock:${email}`);
};

const handleFailedLogin = async (email: string, userId: string): Promise<number> => {
  const failKey = `auth:fail:${email}`;
  const lockKey = `auth:lock:${email}`;

  const attempts = await redis.incr(failKey);
  if (attempts === 1) {
    await redis.expire(failKey, 30 * 60);
  }

  if (attempts >= 10) {
    await redis.set(lockKey, '1', { EX: 30 * 60 });
    await redis.del(failKey);
    await UserModel.updateOne({ _id: userId }, { failedLoginAttempts: 10, lockUntil: new Date(Date.now() + 30 * 60 * 1000) });
    return 10;
  }

  await UserModel.updateOne({ _id: userId }, { failedLoginAttempts: attempts });
  return attempts;
};

const isAccountLocked = async (email: string): Promise<boolean> => {
  const value = await redis.get(`auth:lock:${email}`);
  return Boolean(value);
};

const issueTokenPair = async (
  user: AuthUser,
  familyOverride?: string
): Promise<{ accessToken: string; refreshToken: string; family: string }> => {
  const family = familyOverride ?? uuidv4();

  const accessToken = signAccess({
    userId: user._id.toString(),
    role: user.role,
    plan: user.plan,
    email: user.email
  });

  const refreshToken = signRefresh({
    userId: user._id.toString(),
    family
  });

  const tokenHash = await bcrypt.hash(refreshToken, 8);
  const refreshTtlSeconds = 30 * 24 * 60 * 60;

  await redis.hSet(refreshFamilyKey(family), {
    tokenHash,
    userId: user._id.toString(),
    expiresAt: String(Date.now() + refreshTtlSeconds * 1000)
  });
  await redis.expire(refreshFamilyKey(family), refreshTtlSeconds);

  await redis.sAdd(refreshFamilySetKey(user._id.toString()), family);
  await redis.expire(refreshFamilySetKey(user._id.toString()), refreshTtlSeconds);

  await UserModel.updateOne({ _id: user._id }, { $pull: { refreshTokenFamilies: { family } } });
  await UserModel.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokenFamilies: {
          family,
          tokenHash,
          expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000)
        }
      }
    }
  );

  return { accessToken, refreshToken, family };
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

const invalidateAllTokenFamilies = async (userId: string): Promise<void> => {
  const key = refreshFamilySetKey(userId);
  const families = await redis.sMembers(key);

  if (families.length > 0) {
    const keys = families.map((family) => refreshFamilyKey(family));
    await redis.del(keys);
  }

  await redis.del(key);
  await UserModel.updateOne({ _id: userId }, { $set: { refreshTokenFamilies: [] } });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'Validation error', parsed.error.issues);
      return;
    }

    const { email, password, name } = parsed.data;

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      fail(res, 409, 'Email already registered', undefined, 'EMAIL_EXISTS');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      status: 'unverified',
      emailVerified: false
    });

    await HealthProfileModel.create({
      userId: user._id,
      name
    });

    const otp = String(randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 8);
    await redis.set(`otp:${email.toLowerCase()}`, otpHash, { EX: 600 });

    await sendOtpEmail(email, name, otp);

    created(res, null, 'Check your email for verification code');
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'Validation error', parsed.error.issues);
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const otpKey = `otp:${email}`;

    const otpHash = await redis.get(otpKey);
    if (!otpHash) {
      fail(res, 410, 'OTP expired');
      return;
    }

    const isValidOtp = await bcrypt.compare(parsed.data.otp, otpHash);
    if (!isValidOtp) {
      fail(res, 400, 'Incorrect OTP');
      return;
    }

    const user = await UserModel.findOneAndUpdate(
      { email },
      { emailVerified: true, status: 'active' },
      { new: true }
    );

    if (!user) {
      fail(res, 404, 'User not found');
      return;
    }

    await redis.del(otpKey);

    const tokenPair = await issueTokenPair({
      _id: String(user._id),
      email: user.email,
      role: user.role,
      plan: user.plan,
      status: user.status,
      name: user.name
    });

    setRefreshCookie(res, tokenPair.refreshToken);

    ok(res, {
      accessToken: tokenPair.accessToken,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'Validation error', parsed.error.issues);
      return;
    }

    const email = parsed.data.email.toLowerCase();

    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      fail(res, 401, 'Invalid credentials');
      return;
    }

    const locked = await isAccountLocked(email);
    if (locked) {
      fail(res, 423, 'Account locked. Try again in 30 minutes.');
      return;
    }

    const passwordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!passwordValid) {
      const attempts = await handleFailedLogin(email, String(user._id));
      if (attempts >= 10) {
        fail(res, 423, 'Account locked. Try again in 30 minutes.');
        return;
      }

      fail(res, 401, 'Invalid credentials');
      return;
    }

    if (user.status !== 'active') {
      fail(res, 403, 'Email not verified');
      return;
    }

    await clearLockState(email);

    const tokenPair = await issueTokenPair({
      _id: String(user._id),
      email: user.email,
      role: user.role,
      plan: user.plan,
      status: user.status,
      name: user.name
    });

    setRefreshCookie(res, tokenPair.refreshToken);

    await UserModel.updateOne(
      { _id: user._id },
      { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() }
    );

    ok(res, {
      accessToken: tokenPair.accessToken,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      fail(res, 401, 'No refresh token');
      return;
    }

    const payload = verifyRefresh(refreshToken);
    const familyKey = refreshFamilyKey(payload.family);
    const stored = await redis.hGetAll(familyKey);

    if (!stored.tokenHash) {
      fail(res, 401, 'Invalid refresh token');
      return;
    }

    const valid = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (!valid) {
      await redis.del(familyKey);
      await redis.sRem(refreshFamilySetKey(payload.userId), payload.family);
      logger.warn(`Refresh token reuse detected for user ${payload.userId}`);
      clearRefreshCookie(res);
      fail(res, 401, 'Security alert: please log in again');
      return;
    }

    const user = await UserModel.findById(payload.userId);
    if (!user || user.status !== 'active') {
      fail(res, 401, 'Invalid refresh token');
      return;
    }

    const tokenPair = await issueTokenPair(
      {
        _id: String(user._id),
        email: user.email,
        role: user.role,
        plan: user.plan,
        status: user.status,
        name: user.name
      },
      payload.family
    );

    setRefreshCookie(res, tokenPair.refreshToken);
    ok(res, { accessToken: tokenPair.accessToken });
  } catch (error) {
    fail(res, 401, 'Invalid refresh token');
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (refreshToken) {
      try {
        const payload = verifyRefresh(refreshToken);
        await redis.del(refreshFamilyKey(payload.family));
        await redis.sRem(refreshFamilySetKey(payload.userId), payload.family);
        await UserModel.updateOne({ _id: payload.userId }, { $pull: { refreshTokenFamilies: { family: payload.family } } });
      } catch {
        // If token is invalid, we still clear cookie and return success.
      }
    }

    clearRefreshCookie(res);
    ok(res, null, 'Logged out');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'Validation error', parsed.error.issues);
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const user = await UserModel.findOne({ email });

    if (user) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      await redis.set(`reset:${tokenHash}`, String(user._id), { EX: 60 * 60 });

      const resetLink = `${env.APP_BASE_URL}/reset-password?token=${token}`;
      await sendResetPasswordEmail(email, resetLink);
    }

    ok(res, null, 'Reset link sent');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'Validation error', parsed.error.issues);
      return;
    }

    const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex');
    const userId = await redis.get(`reset:${tokenHash}`);

    if (!userId) {
      fail(res, 400, 'Invalid or expired reset token');
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await UserModel.updateOne(
      { _id: userId },
      { passwordHash, failedLoginAttempts: 0, lockUntil: null, status: 'active', emailVerified: true }
    );

    await redis.del(`reset:${tokenHash}`);
    await invalidateAllTokenFamilies(userId);

    ok(res, null, 'Password reset');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    fail(res, 401, 'Unauthorized');
    return;
  }

  ok(res, req.user);
};
