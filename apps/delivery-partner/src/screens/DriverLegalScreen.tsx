import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Linking, ActivityIndicator } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

const API_BASE_URL =
  globalThis.process?.env?.API_BASE_URL ||
  globalThis.process?.env?.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

const policyLinks = [
  { key: 'driver_agreement', label: 'Driver Agreement' },
  { key: 'terms_of_service', label: 'Terms of Service' },
  { key: 'privacy_policy', label: 'Privacy Policy' },
  { key: 'cookie_policy', label: 'Cookie Policy' },
  { key: 'data_retention_policy', label: 'Data Retention Policy' },
];

async function fetchDriverAgreement(): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/agreements/current/driver/driver_agreement`);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export default function DriverLegalScreen(_props: ScreenProps): React.JSX.Element {
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const loadAgreement = useCallback(async (signal: { active: boolean }) => {
    try {
      const data = await fetchDriverAgreement();
      if (!signal.active) return;
      if (data) setAgreement(data);
      setLoading(false);
    } catch {
      if (signal.active) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { active: true };
    loadAgreement(signal);
    return () => {
      signal.active = false;
    };
  }, [loadAgreement]);

  const accept = async () => {
    try {
      const token = await (await import('@react-native-async-storage/async-storage')).default.getItem('driver_token');
      await fetch(`${API_BASE_URL}/agreements/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ agreementId: agreement?.id, partyType: 'driver' }),
      });
      setAccepted(true);
    } catch {
      setAccepted(true);
    }
  };

  return (
    <Screen title="Legal & Agreements" navigation={_props.navigation}>
      <ScrollView contentContainerStyle={{ padding: DESIGN_TOKENS.spacing.md }}>
        <CardView style={{ padding: DESIGN_TOKENS.spacing.md, marginBottom: DESIGN_TOKENS.spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 8 }}>
            Driver Agreement
          </Text>
          {loading ? (
            <ActivityIndicator color={DESIGN_TOKENS.colors.primary} />
          ) : agreement ? (
            <>
              <Text style={{ fontSize: 13, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: 8 }}>
                Version {agreement.version} · Effective {agreement.effectiveDate ? new Date(agreement.effectiveDate).toLocaleDateString() : '—'}
              </Text>
              <Text style={{ fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: 12 }} numberOfLines={6}>
                {agreement.summary || 'Independent contractor terms, insurance requirements, GPS consent, payment and settlement rules.'}
              </Text>
              <Pressable
                disabled={accepted}
                onPress={accept}
                style={({ pressed }) => ({
                  backgroundColor: accepted ? DESIGN_TOKENS.colors.border : DESIGN_TOKENS.colors.primary,
                  paddingVertical: 12,
                  borderRadius: DESIGN_TOKENS.radius.md,
                  opacity: pressed ? 0.85 : 1,
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{accepted ? 'Accepted' : 'Accept Agreement'}</Text>
              </Pressable>
            </>
          ) : (
            <Text style={{ fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary }}>Agreement unavailable offline.</Text>
          )}
        </CardView>

        <Text style={[sectionTitle, { marginBottom: DESIGN_TOKENS.spacing.sm }]}>Policies & Disclosures</Text>
        <CardView style={{ padding: 0, overflow: 'hidden' }}>
          {policyLinks.map((p, i) => (
            <Pressable
              key={p.key}
              style={[row, i < policyLinks.length - 1 && rowBorder]}
              onPress={() => Linking.openURL(`${API_BASE_URL}/legal/documents/${p.key}`)}
            >
              <View style={iconBox}>
                <Ionicons name="document-text-outline" size={18} color={DESIGN_TOKENS.colors.primary} />
              </View>
              <Text style={label}>{p.label}</Text>
              <Ionicons name="open-outline" size={18} color={DESIGN_TOKENS.colors.textTertiary} />
            </Pressable>
          ))}
        </CardView>

        <Text style={[sectionTitle, { marginTop: DESIGN_TOKENS.spacing.lg, marginBottom: DESIGN_TOKENS.spacing.sm }]}>Your Rights</Text>
        <CardView style={{ padding: DESIGN_TOKENS.spacing.md }}>
          <Text style={{ fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, lineHeight: 20 }}>
            Under the DPDP Act, 2023 you may withdraw consent, request access to, or deletion of your personal data. Location tracking is used only while you are on active deliveries and requires your consent.
          </Text>
        </CardView>
      </ScrollView>
    </Screen>
  );
}

const sectionTitle: any = {
  fontSize: 13,
  fontWeight: '600',
  color: DESIGN_TOKENS.colors.textSecondary,
  fontFamily: DESIGN_TOKENS.typography.fontFamily,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const row: any = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: DESIGN_TOKENS.spacing.md,
  paddingHorizontal: DESIGN_TOKENS.spacing.md,
};
const rowBorder: any = { borderBottomWidth: 1, borderBottomColor: DESIGN_TOKENS.colors.borderLight };
const iconBox: any = {
  width: 32,
  height: 32,
  borderRadius: DESIGN_TOKENS.radius.sm,
  backgroundColor: DESIGN_TOKENS.colors.primaryLight,
  justifyContent: 'center',
  alignItems: 'center',
};
const label: any = {
  fontSize: 15,
  color: DESIGN_TOKENS.colors.textPrimary,
  fontWeight: '500',
  fontFamily: DESIGN_TOKENS.typography.fontFamily,
  flex: 1,
  marginLeft: DESIGN_TOKENS.spacing.sm,
};
