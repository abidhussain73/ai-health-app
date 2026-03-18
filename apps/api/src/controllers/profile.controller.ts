import { NextFunction, Request, Response } from 'express';
import { HealthProfileModel } from '../models/HealthProfile.model';
import { setupProfileSchema } from '../validators/profile.validator';
import { fail, ok } from '../utils/response';

export const setupProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      fail(res, 401, 'Unauthorized');
      return;
    }

    const parsed = setupProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, 'Validation error', parsed.error.issues);
      return;
    }

    const data = parsed.data;
    const diagnosisDate = new Date(data.diagnosisYear, 0, 1);

    const profile = await HealthProfileModel.findOneAndUpdate(
      { userId: req.user.id },
      {
        diabetesType: data.diabetesType,
        diagnosisDate,
        glucoseTargetMin: data.targetGlucoseMin,
        glucoseTargetMax: data.targetGlucoseMax,
        demographic: {
          age: data.age,
          gender: data.gender,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          activityLevel: data.activityLevel
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    ok(res, profile, 'Profile setup completed');
  } catch (error) {
    next(error);
  }
};
