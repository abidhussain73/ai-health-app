'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

type ProfilePayload = {
  age: number;
  gender: string;
  diabetesType: string;
  diagnosisYear: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
};

export default function SetupProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProfilePayload>({
    age: 30,
    gender: 'male',
    diabetesType: 'type2',
    diagnosisYear: new Date().getFullYear() - 2,
    heightCm: 170,
    weightKg: 70,
    activityLevel: 'moderate',
    targetGlucoseMin: 80,
    targetGlucoseMax: 140,
  });

  const title = useMemo(() => {
    if (step === 1) return 'Basic Details';
    if (step === 2) return 'Medical Details';
    if (step === 3) return 'Body Metrics';
    if (step === 4) return 'Lifestyle';
    return 'Glucose Targets';
  }, [step]);

  const setField = <K extends keyof ProfilePayload>(key: K, value: ProfilePayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const next = (): void => setStep((s) => Math.min(5, s + 1));
  const back = (): void => setStep((s) => Math.max(1, s - 1));

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/profile/setup', form);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: 420, display: 'grid', gap: 10 }}>
        <h1>Setup Profile</h1>
        <p>
          Step {step}/5: {title}
        </p>

        {step === 1 ? (
          <>
            <label>
              Age
              <input type='number' value={form.age} onChange={(e) => setField('age', Number(e.target.value))} />
            </label>
            <label>
              Gender
              <select value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='other'>Other</option>
              </select>
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <label>
              Diabetes Type
              <select value={form.diabetesType} onChange={(e) => setField('diabetesType', e.target.value)}>
                <option value='type1'>Type 1</option>
                <option value='type2'>Type 2</option>
                <option value='gestational'>Gestational</option>
                <option value='prediabetes'>Prediabetes</option>
              </select>
            </label>
            <label>
              Diagnosis Year
              <input type='number' value={form.diagnosisYear} onChange={(e) => setField('diagnosisYear', Number(e.target.value))} />
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <label>
              Height (cm)
              <input type='number' value={form.heightCm} onChange={(e) => setField('heightCm', Number(e.target.value))} />
            </label>
            <label>
              Weight (kg)
              <input type='number' value={form.weightKg} onChange={(e) => setField('weightKg', Number(e.target.value))} />
            </label>
          </>
        ) : null}

        {step === 4 ? (
          <label>
            Activity Level
            <select value={form.activityLevel} onChange={(e) => setField('activityLevel', e.target.value)}>
              <option value='sedentary'>Sedentary</option>
              <option value='light'>Light</option>
              <option value='moderate'>Moderate</option>
              <option value='active'>Active</option>
            </select>
          </label>
        ) : null}

        {step === 5 ? (
          <>
            <label>
              Target Glucose Min
              <input type='number' value={form.targetGlucoseMin} onChange={(e) => setField('targetGlucoseMin', Number(e.target.value))} />
            </label>
            <label>
              Target Glucose Max
              <input type='number' value={form.targetGlucoseMax} onChange={(e) => setField('targetGlucoseMax', Number(e.target.value))} />
            </label>
          </>
        ) : null}

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type='button' onClick={back} disabled={step === 1 || submitting}>
            Back
          </button>
          {step < 5 ? (
            <button type='button' onClick={next} disabled={submitting}>
              Next
            </button>
          ) : (
            <button type='submit' disabled={submitting}>
              {submitting ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
