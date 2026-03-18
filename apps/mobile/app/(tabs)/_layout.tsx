import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name='dashboard' options={{ title: 'Dashboard' }} />
      <Tabs.Screen name='glucose' options={{ title: 'Glucose' }} />
      <Tabs.Screen name='nutrition' options={{ title: 'Nutrition' }} />
      <Tabs.Screen name='activity' options={{ title: 'Activity' }} />
      <Tabs.Screen name='health' options={{ title: 'Health' }} />
      <Tabs.Screen name='profile' options={{ title: 'Profile' }} />
    </Tabs>
  );
}
