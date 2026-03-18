'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';

export default function VerifyEmailPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const queryEmail = new URLSearchParams(window.location.search).get('email');
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, []);

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      const accessToken = res.data?.data?.accessToken as string | undefined;
      const user = res.data?.data?.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      document.cookie = `accessToken=${accessToken}; path=/`;
      setUser(user);
      router.replace('/setup-profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: 360, display: 'grid', gap: 8 }}>
        <h1>Verify Email</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='6-digit OTP' />
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <button type='submit' disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
      </form>
    </main>
  );
}
