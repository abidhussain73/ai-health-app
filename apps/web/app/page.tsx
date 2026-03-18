type HealthResponse = {
  status: string;
  db: string;
  redis: string;
  timestamp: string;
};

async function getHealth(): Promise<HealthResponse | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/health`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await getHealth();

  return (
    <main style={{ padding: '24px' }}>
      <h1>Week 1 Web Scaffold</h1>
      <p>Backend health: {health ? `${health.status} (db: ${health.db}, redis: ${health.redis})` : 'unavailable'}</p>
    </main>
  );
}
