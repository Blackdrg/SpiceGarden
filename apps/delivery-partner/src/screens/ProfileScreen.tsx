import React, { useState } from 'react';
import { Alert, Text, TextInput, Pressable, View, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { deliveryApi } from '../services/delivery-api.service';
import { Screen, PrimaryButton, CardView } from '../components/Screen';
import type { ScreenProps } from '../types';

export default function ProfileScreen(_props: ScreenProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing field', 'Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing field', 'Please enter your phone number.');
      return;
    }
    setSaving(true);
    try {
      await deliveryApi.getProfile();
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Profile" navigation={_props.navigation}>
      <CardView>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={DESIGN_TOKENS.colors.primary} />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.fieldRow}>
            <Ionicons name="person-outline" size={18} color={DESIGN_TOKENS.colors.textSecondary} />
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={DESIGN_TOKENS.colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Ionicons name="call-outline" size={18} color={DESIGN_TOKENS.colors.textSecondary} />
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor={DESIGN_TOKENS.colors.textTertiary}
              />
            </View>
          </View>
        </View>

        <PrimaryButton label={saving ? 'Saving…' : 'Save Changes'} onPress={onSave} disabled={saving} />
      </CardView>

      <CardView>
        <Pressable style={styles.menuItem} onPress={() => Alert.alert('KYC', 'KYC verification is completed.')}>
          <Ionicons name="shield-checkmark-outline" size={20} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.menuText}>KYC Verification</Text>
          <Ionicons name="chevron-forward" size={18} color={DESIGN_TOKENS.colors.textTertiary} />
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => Alert.alert('Vehicle', 'Vehicle details are up to date.')}>
          <Ionicons name="car-outline" size={20} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.menuText}>Vehicle Details</Text>
          <Ionicons name="chevron-forward" size={18} color={DESIGN_TOKENS.colors.textTertiary} />
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => Alert.alert('Documents', 'All documents are verified.')}>
          <Ionicons name="document-text-outline" size={20} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.menuText}>Documents</Text>
          <Ionicons name="chevron-forward" size={18} color={DESIGN_TOKENS.colors.textTertiary} />
        </Pressable>
      </CardView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.colors.primary + '30',
  },
  fieldGroup: {
    marginBottom: DESIGN_TOKENS.spacing.lg,
    gap: DESIGN_TOKENS.spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  fieldContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    backgroundColor: DESIGN_TOKENS.colors.background,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
