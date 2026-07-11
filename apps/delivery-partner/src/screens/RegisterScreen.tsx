import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { deliveryApi } from '../services/delivery-api.service';
import { Screen, PrimaryButton, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

const VEHICLES = ['bike', 'scooter', 'car', 'bicycle'];

export default function RegisterScreen({ navigation }: ScreenProps): React.JSX.Element {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    vehicleType: 'bike',
    vehicleNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onRegister = async () => {
    if (!form.name || !form.phone || !form.email || !form.licenseNumber || !form.vehicleNumber) {
      Alert.alert('Missing fields', 'Please complete all fields.');
      return;
    }
    setLoading(true);
    try {
      await deliveryApi.registerDriver(form);
      navigation.navigate('Kyc');
    } catch (e) {
      Alert.alert('Registration failed', e instanceof Error ? e.message : 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Driver Registration" navigation={navigation}>
      <CardView>
        <Field label="Full Name" value={form.name} onChange={(v) => set('name', v)} />
        <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} keyboard="phone-pad" />
        <Field label="Email" value={form.email} onChange={(v) => set('email', v)} keyboard="email-address" />
        <Field label="License Number" value={form.licenseNumber} onChange={(v) => set('licenseNumber', v)} />
        <Text style={labelStyle}>Vehicle Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {VEHICLES.map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => set('vehicleType', v)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: form.vehicleType === v ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
              }}
            >
              <Text style={{ color: form.vehicleType === v ? '#fff' : DESIGN_TOKENS.colors.textPrimary, fontWeight: '600' }}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field label="Vehicle Number" value={form.vehicleNumber} onChange={(v) => set('vehicleNumber', v)} />
        <PrimaryButton label={loading ? 'Submitting…' : 'Continue to KYC'} onPress={onRegister} disabled={loading} />
      </CardView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: 'phone-pad' | 'email-address';
}): React.JSX.Element {
  return (
    <>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
        placeholder={label}
      />
    </>
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
  marginTop: 6,
  marginBottom: 12,
};

const labelStyle = {
  fontSize: 14,
  fontWeight: '600',
  color: DESIGN_TOKENS.colors.textSecondary,
  marginTop: 6,
};
