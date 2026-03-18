const API_BASE = 'http://localhost:5000/api/v1/auth';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    message: string;
  };
};

type AuthSuccess = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
    status: string;
    name: string;
  };
};

const parseResponse = async <T>(res: Response): Promise<T> => {
  const payload = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !payload.success) {
    throw new Error(payload.error?.message ?? 'Request failed');
  }

  return payload.data;
};

export const registerRequest = async (name: string, email: string, password: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  await parseResponse<null>(res);
};

export const verifyEmailRequest = async (email: string, otp: string): Promise<AuthSuccess> => {
  const res = await fetch(`${API_BASE}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });

  return parseResponse<AuthSuccess>(res);
};

export const loginRequest = async (email: string, password: string): Promise<AuthSuccess> => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  return parseResponse<AuthSuccess>(res);
};

export const forgotPasswordRequest = async (email: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  await parseResponse<null>(res);
};

export const resetPasswordRequest = async (token: string, newPassword: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });

  await parseResponse<null>(res);
};

export const completeProfileSetup = async (
  token: string,
  profile: Record<string, unknown>
): Promise<void> => {
  const res = await fetch(`${API_BASE}/profile/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profile)
  });

  await parseResponse<null>(res);
};
