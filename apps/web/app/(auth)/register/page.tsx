'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={register} style={{ width: 360, display: 'grid', gap: 8 }}>
        <h1>Register</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' type='password' />
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <button type='submit' disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>
    </main>
  );
}
