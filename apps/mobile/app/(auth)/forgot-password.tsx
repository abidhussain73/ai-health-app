import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPasswordRequest } from '../../services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (): Promise<void> => {
    setLoading(true);
    try {
      await forgotPasswordRequest(email);
      Alert.alert('Success', 'If your email exists, reset link has been sent.');
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Forgot Password</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
        placeholder='Email'
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
      />
      <Button title={loading ? 'Sending...' : 'Send reset link'} onPress={() => void submit()} disabled={loading} />
      <Button title='Back to login' onPress={() => router.replace('/(auth)/login')} />
    </View>
  );
}
