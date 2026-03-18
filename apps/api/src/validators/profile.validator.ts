import { z } from 'zod';

export const setupProfileSchema = z.object({
  age: z.number().int().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  diabetesType: z.enum(['type1', 'type2', 'gestational', 'prediabetes']),
  diagnosisYear: z.number().int().min(1950).max(new Date().getFullYear()),
  heightCm: z.number().min(50).max(260),
  weightKg: z.number().min(20).max(400),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active']),
  targetGlucoseMin: z.number().min(40).max(300),
  targetGlucoseMax: z.number().min(50).max(400)
});
