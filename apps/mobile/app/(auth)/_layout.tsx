import React from 'react';
import { View } from 'react-native';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
