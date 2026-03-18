import React from 'react';
import { Text, View } from 'react-native';

type HealthState = 'idle' | 'ok' | 'error';

export default function Dashboard() {
  const [healthState, setHealthState] = React.useState<HealthState>('idle');

  React.useEffect(() => {
    const baseUrl = 'http://localhost:5000';

    void fetch(`${baseUrl}/api/v1/health`)
      .then((res) => {
        if (res.ok) {
          setHealthState('ok');
          return;
        }

        setHealthState('error');
      })
      .catch(() => setHealthState('error'));
  }, []);

  return (
    <View>
      <Text>Dashboard (stub)</Text>
      <Text>API health check: {healthState}</Text>
    </View>
  );
}
