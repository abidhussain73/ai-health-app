import React from 'react';
import { Button, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { deleteToken } from '../../services/storage.service';

export default function ProfileScreen() {
  const router = useRouter();

  const logout = async (): Promise<void> => {
    await deleteToken();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Text>Profile</Text>
      <Button title='Logout' onPress={() => void logout()} />
    </View>
  );
}
