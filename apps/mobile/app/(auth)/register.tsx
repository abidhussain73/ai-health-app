import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerRequest } from '../../services/auth.service';

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { control, handleSubmit, formState, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await registerRequest(values.name, values.email, values.password);
      router.replace({ pathname: '/(auth)/verify-email', params: { email: values.email } });
    } catch (error) {
      Alert.alert('Register failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setLoading(false);
    }
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Create account</Text>
      <Controller
        name='name'
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder='Name'
            style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
          />
        )}
      />
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
      <Controller
        name='confirmPassword'
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            secureTextEntry
            placeholder='Confirm password'
            style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
          />
        )}
      />
      {formState.errors.confirmPassword ? <Text>{formState.errors.confirmPassword.message}</Text> : null}
      <Button title={loading ? 'Creating account...' : 'Register'} onPress={onSubmit} disabled={loading} />
      <Button title='Back to login' onPress={() => router.replace('/(auth)/login')} />
      <Text>Using email: {getValues('email') || '-'}</Text>
    </View>
  );
}
