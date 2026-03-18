import React from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeContext';
import { getToken } from '../services/storage.service';

export default function RootLayout() {
  const segments = useSegments();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      const token = await getToken();
      setIsAuthenticated(Boolean(token));
      setIsLoading(false);
    };

    void load();
  }, []);

  if (isLoading) {
    return null;
  }

  const inAuthGroup = segments[0] === '(auth)';

  return (
    <ThemeProvider>
      {!isAuthenticated && !inAuthGroup ? <Redirect href='/(auth)/login' /> : null}
      {isAuthenticated && inAuthGroup ? <Redirect href='/(tabs)/dashboard' /> : null}
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
