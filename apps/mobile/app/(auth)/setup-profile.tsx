import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { completeProfileSetup } from '../../services/auth.service';
import { getToken } from '../../services/storage.service';

const steps = ['Basic Info', 'Medical History', 'Health Targets', 'Medications', 'Emergency Contacts'];

export default function SetupProfileScreen() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [dob, setDob] = React.useState('1990-01-01');
  const [gender, setGender] = React.useState('Prefer not to say');
  const [conditions, setConditions] = React.useState('');
  const [glucoseMin, setGlucoseMin] = React.useState('70');
  const [glucoseMax, setGlucoseMax] = React.useState('140');
  const [medications, setMedications] = React.useState('');
  const [emergencyContact, setEmergencyContact] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submitFinal = async (): Promise<void> => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Session expired', 'Please login again.');
      router.replace('/(auth)/login');
      return;
    }

    setLoading(true);
    try {
      await completeProfileSetup(token, {
        name,
        dob,
        gender,
        conditions: conditions
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        glucoseTargetMin: Number(glucoseMin),
        glucoseTargetMax: Number(glucoseMax),
        medications: medications
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        emergencyContacts: emergencyContact
          ? [
              {
                name: emergencyContact,
                phone: '',
                relationship: 'Contact'
              }
            ]
          : []
      });
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const next = (): void => {
    if (step === steps.length - 1) {
      void submitFinal();
      return;
    }
    setStep((s) => s + 1);
  };

  const back = (): void => setStep((s) => Math.max(0, s - 1));

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Profile Setup ({step + 1}/5)</Text>
      <Text>{steps[step]}</Text>

      {step === 0 ? (
        <>
          <TextInput value={name} onChangeText={setName} placeholder='Full name' style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }} />
          <TextInput value={dob} onChangeText={setDob} placeholder='DOB (YYYY-MM-DD)' style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }} />
          <TextInput value={gender} onChangeText={setGender} placeholder='Gender' style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }} />
        </>
      ) : null}

      {step === 1 ? (
        <TextInput
          value={conditions}
          onChangeText={setConditions}
          placeholder='Conditions (comma separated)'
          style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
        />
      ) : null}

      {step === 2 ? (
        <>
          <TextInput value={glucoseMin} onChangeText={setGlucoseMin} keyboardType='number-pad' placeholder='Glucose min' style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }} />
          <TextInput value={glucoseMax} onChangeText={setGlucoseMax} keyboardType='number-pad' placeholder='Glucose max' style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }} />
        </>
      ) : null}

      {step === 3 ? (
        <TextInput
          value={medications}
          onChangeText={setMedications}
          placeholder='Medications (comma separated)'
          style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
        />
      ) : null}

      {step === 4 ? (
        <TextInput
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          placeholder='Emergency contact name'
          style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10 }}
        />
      ) : null}

      <Button title={step === steps.length - 1 ? (loading ? 'Saving...' : 'Finish') : 'Next'} onPress={next} disabled={loading} />
      <Button title='Back' onPress={back} />
    </View>
  );
}
