import React from 'react';
import { Text, View } from 'react-native';
import { ThemeProvider } from '../theme/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Week 1 Mobile Scaffold</Text>
      </View>
    </ThemeProvider>
  );
}
