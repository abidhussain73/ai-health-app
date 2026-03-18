import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main style={{ minHeight: '100vh', padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome to your health dashboard.</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <Link href='/setup-profile'>Setup profile</Link>
        <Link href='/login'>Login</Link>
        <Link href='/register'>Register</Link>
      </div>
    </main>
  );
}
