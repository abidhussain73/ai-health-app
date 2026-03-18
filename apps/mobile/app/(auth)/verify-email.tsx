import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { verifyEmailRequest } from '../../services/auth.service';
import { saveToken } from '../../services/storage.service';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const email = params.email ?? '';

  const submit = async (): Promise<void> => {
    if (!email || otp.length !== 6) {
      Alert.alert('Invalid input', 'Enter 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmailRequest(email, otp);
      await saveToken(result.accessToken);
      router.replace('/(auth)/setup-profile');
    } catch (error) {
      Alert.alert('Verification failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Verify Email</Text>
      <Text>Code sent to: {email || 'unknown email'}</Text>
      <TextInput
        value={otp}
        onChangeText={(value) => setOtp(value.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType='number-pad'
        placeholder='Enter 6-digit code'
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
      />
      <Button title={loading ? 'Verifying...' : 'Verify'} onPress={() => void submit()} disabled={loading} />
      <Button title='Back to register' onPress={() => router.replace('/(auth)/register')} />
    </View>
  );
}
