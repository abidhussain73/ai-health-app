import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginRequest } from '../../services/auth.service';
import { saveToken } from '../../services/storage.service';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { control, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const result = await loginRequest(values.email, values.password);
      await saveToken(result.accessToken);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setLoading(false);
    }
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Login</Text>
      <Controller
        name='email'
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            autoCapitalize='none'
            keyboardType='email-address'
            placeholder='Email'
            style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
          />
        )}
      />
      {formState.errors.email ? <Text>{formState.errors.email.message}</Text> : null}
      <Controller
        name='password'
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            secureTextEntry
            placeholder='Password'
            style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
          />
        )}
      />
      {formState.errors.password ? <Text>{formState.errors.password.message}</Text> : null}
      <Button title={loading ? 'Signing in...' : 'Sign in'} onPress={onSubmit} disabled={loading} />
      <Button title='Create account' onPress={() => router.push('/(auth)/register')} />
      <Button title='Forgot password' onPress={() => router.push('/(auth)/forgot-password')} />
    </View>
  );
}
