import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { resetPasswordRequest } from '../../services/auth.service';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [newPassword, setNewPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (): Promise<void> => {
    const token = params.token ?? '';
    if (!token) {
      Alert.alert('Missing token', 'Reset link token not found.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest(token, newPassword);
      Alert.alert('Success', 'Password reset completed.');
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Reset Password</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder='New password'
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
      />
      <Button title={loading ? 'Updating...' : 'Update password'} onPress={() => void submit()} disabled={loading} />
      <Button title='Back to login' onPress={() => router.replace('/(auth)/login')} />
    </View>
  );
}
