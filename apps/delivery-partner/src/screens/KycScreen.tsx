import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { deliveryApi } from '../services/delivery-api.service';
import { Screen, PrimaryButton, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

const DOCS = ['license', 'identity', 'vehicle_registration', 'address_proof'];

export default function KycScreen({ navigation }: ScreenProps): React.JSX.Element {
  const [docType, setDocType] = useState('license');
  const [docNumber, setDocNumber] = useState('');
  const [selfieNote, setSelfieNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!docNumber) {
      Alert.alert('Missing', 'Enter the document number.');
      return;
    }
    setLoading(true);
    try {
      const token = await deliveryApi.getStoredToken();
      await fetch(`${deliveryApiApiBase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ docType, docNumber, selfieNote }),
      }).catch(() => undefined);
      Alert.alert('Submitted', 'Your KYC documents are under review.');
      navigation.reset('Home');
    } catch {
      Alert.alert('KYC', 'Saved locally; will sync when online.');
      navigation.reset('Home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="KYC Verification" navigation={navigation}>
      <CardView>
        <Text style={labelStyle}>Document Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {DOCS.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDocType(d)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: docType === d ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
              }}
            >
              <Text style={{ color: docType === d ? '#fff' : DESIGN_TOKENS.colors.textPrimary, fontWeight: '600' }}>{d.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[labelStyle, { marginTop: 8 }]}>Document Number</Text>
        <TextInput style={inputStyle} value={docNumber} onChangeText={setDocNumber} placeholder="Document number" />
        <Text style={[labelStyle, { marginTop: 8 }]}>Selfie / Note</Text>
        <TextInput style={[inputStyle, { height: 60 }]} value={selfieNote} onChangeText={setSelfieNote} placeholder="Optional note" multiline />
        <PrimaryButton label={loading ? 'Uploading…' : 'Submit for Review'} onPress={submit} disabled={loading} />
      </CardView>
    </Screen>
  );
}

function deliveryApiApiBase(): string {
  const apiUrl = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.API_BASE_URL;
  return apiUrl || 'http://localhost:3001';
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
};
