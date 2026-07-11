import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { deliveryApi } from '../services/delivery-api.service';
import { Screen, PrimaryButton, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

export default function AuthScreen({ navigation }: ScreenProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await deliveryApi.login(email, password);
      navigation.reset('Home');
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Partner Sign In" navigation={navigation} showBack={false}>
      <CardView>
        <Text style={labelStyle}>Email</Text>
        <TextInput
          style={inputStyle}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="driver@spicegarden.com"
        />
        <Text style={[labelStyle, { marginTop: 12 }]}>Password</Text>
        <TextInput
          style={inputStyle}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        <PrimaryButton label={loading ? 'Signing in…' : 'Sign In'} onPress={onLogin} disabled={loading} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: DESIGN_TOKENS.colors.primary, fontWeight: '600' }}>New driver? Register</Text>
        </TouchableOpacity>
      </CardView>
    </Screen>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: DESIGN_TOKENS.colors.border,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  color: DESIGN_TOKENS.colors.textPrimary,
  backgroundColor: DESIGN_TOKENS.colors.background,
};

const labelStyle = {
  fontSize: 14,
  fontWeight: '600',
  color: DESIGN_TOKENS.colors.textSecondary,
  marginBottom: 6,
};
