import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={styles.formHeader}>
          <View style={styles.formIconContainer}>
            <Ionicons name="person-add-outline" size={24} color={DESIGN_TOKENS.colors.primary} />
          </View>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Fill in your details to get started</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Field label="Full Name" value={form.name} onChange={(v) => set('name', v)} icon="person-outline" />
          <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} keyboard="phone-pad" icon="call-outline" />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} keyboard="email-address" icon="mail-outline" />
          <Field label="License Number" value={form.licenseNumber} onChange={(v) => set('licenseNumber', v)} icon="card-outline" />

          <Text style={styles.fieldLabel}>Vehicle Type</Text>
          <View style={styles.vehicleGrid}>
            {VEHICLES.map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => set('vehicleType', v)}
                style={[
                  styles.vehicleChip,
                  form.vehicleType === v ? styles.vehicleChipActive : {},
                ]}
              >
                {form.vehicleType === v && (
                  <Ionicons name="checkmark-circle" size={16} color={DESIGN_TOKENS.colors.primary} />
                )}
                <Text style={[
                  styles.vehicleLabel,
                  form.vehicleType === v ? styles.vehicleLabelActive : {},
                ]}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field label="Vehicle Number" value={form.vehicleNumber} onChange={(v) => set('vehicleNumber', v)} icon="car-outline" />
        </View>

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
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: 'phone-pad' | 'email-address';
  icon?: string;
}): React.JSX.Element {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        {icon && <Ionicons name={icon as any} size={18} color={DESIGN_TOKENS.colors.textSecondary} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
          placeholder={label}
          placeholderTextColor={DESIGN_TOKENS.colors.textTertiary}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  formHeader: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  formIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DESIGN_TOKENS.radius.lg,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  fieldGroup: {
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  vehicleChip: {
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
  vehicleChipActive: {
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    borderColor: DESIGN_TOKENS.colors.primary,
  },
  vehicleLabel: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  vehicleLabelActive: {
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '700',
  },
});
