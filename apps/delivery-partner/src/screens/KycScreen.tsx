import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { deliveryApi } from '../services/delivery-api.service';
import { Screen, PrimaryButton, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

const DOCS = ['license', 'identity', 'vehicle_registration', 'address_proof'];

const docLabels: Record<string, string> = {
  license: "Driver's License",
  identity: 'ID Proof',
  vehicle_registration: 'Vehicle RC',
  address_proof: 'Address Proof',
};

export default function KycScreen({ navigation }: ScreenProps): React.JSX.Element {
  const [docType, setDocType] = useState('license');
  const [docNumber, setDocNumber] = useState('');
  const [selfieNote, setSelfieNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const submit = async () => {
    if (!docNumber) {
      Alert.alert('Missing', 'Enter the document number.');
      return;
    }
    setLoading(true);
    try {
      const token = await deliveryApi.getStoredToken();
      const response = await fetch(`${deliveryApiApiBase()}/api/drivers/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ docType, docNumber, selfieNote }),
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`KYC submission failed: ${response.status} ${errorText}`);
      }
      Alert.alert('Submitted', 'Your KYC documents are under review.');
      navigation.reset('Home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit KYC.';
      Alert.alert('KYC Error', message);
    } finally {
      setLoading(false);
    }
};

  return (
    <Screen title="KYC Verification" navigation={navigation}>
      <CardView>
        <View style={styles.kycHeader}>
          <View style={styles.kycIconContainer}>
            <Ionicons name="shield-checkmark-outline" size={28} color={DESIGN_TOKENS.colors.primary} />
          </View>
          <Text style={styles.kycTitle}>Document Verification</Text>
          <Text style={styles.kycSubtitle}>Upload your documents for verification</Text>
        </View>

        <Text style={styles.fieldLabel}>Document Type</Text>
        <View style={styles.docTypeGrid}>
          {DOCS.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDocType(d)}
              style={[
                styles.docTypeChip,
                docType === d ? styles.docTypeChipActive : {},
              ]}
            >
              {docType === d && (
                <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.primary} />
              )}
              <Text style={[
                styles.docTypeLabel,
                docType === d ? styles.docTypeLabelActive : {},
              ]}>
                {docLabels[d] || d.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Document Number</Text>
        <View style={styles.inputRow}>
          <Ionicons name="document-text-outline" size={18} color={DESIGN_TOKENS.colors.textSecondary} />
          <TextInput
            style={styles.input}
            value={docNumber}
            onChangeText={setDocNumber}
            placeholder="Enter document number"
            placeholderTextColor={DESIGN_TOKENS.colors.textTertiary}
          />
        </View>

        <Text style={styles.fieldLabel}>Selfie / Note (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={selfieNote}
          onChangeText={setSelfieNote}
          placeholder="Any notes for verification"
          multiline
          numberOfLines={3}
        />

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

const styles = StyleSheet.create({
  kycHeader: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  kycIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DESIGN_TOKENS.radius.lg,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  kycTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: 4,
  },
  kycSubtitle: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  docTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  docTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
  },
  docTypeChipActive: {
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    borderColor: DESIGN_TOKENS.colors.primary,
  },
  docTypeLabel: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  docTypeLabelActive: {
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  textArea: {
    minHeight: 80,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    textAlignVertical: 'top',
  },
});
