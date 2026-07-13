import React, { useState } from 'react';
import { Alert, Text, TextInput, Pressable, View, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { deliveryApi } from '../services/delivery-api.service';
import { Screen, PrimaryButton, CardView } from '../components/Screen';
import { LoadingSpinner } from '../components/Indicators';
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
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="car" size={32} color={DESIGN_TOKENS.colors.primary} />
        </View>
        <Text style={styles.brandText}>SpiceGarden Partner</Text>
        <Text style={styles.brandSubtext}>Delivery Partner Portal</Text>
      </View>

      <CardView>
        <View style={styles.fieldGroup}>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={DESIGN_TOKENS.colors.textSecondary} />
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="driver@spicegarden.com"
              placeholderTextColor={DESIGN_TOKENS.colors.textTertiary}
            />
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={DESIGN_TOKENS.colors.textSecondary} />
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={DESIGN_TOKENS.colors.textTertiary}
            />
          </View>
        </View>
        <PrimaryButton label={loading ? 'Signing in…' : 'Sign In'} onPress={onLogin} disabled={loading} />
        <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
          <Text style={styles.registerText}>New driver? </Text>
          <Text style={styles.registerLink}>Register</Text>
        </Pressable>
      </CardView>
    </Screen>
  );
}

const inputStyle: Record<string, number | string | undefined> = {
  borderWidth: 1,
  borderColor: DESIGN_TOKENS.colors.border,
  borderRadius: DESIGN_TOKENS.radius.lg,
  paddingHorizontal: DESIGN_TOKENS.spacing.md,
  paddingVertical: DESIGN_TOKENS.spacing.sm,
  fontSize: 15,
  color: DESIGN_TOKENS.colors.textPrimary,
  backgroundColor: DESIGN_TOKENS.colors.background,
};

const labelStyle: Record<string, number | string | undefined> = {
  fontSize: 14,
  fontWeight: '600',
  color: DESIGN_TOKENS.colors.textSecondary,
  marginBottom: 6,
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xl,
    paddingTop: DESIGN_TOKENS.spacing.md,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: DESIGN_TOKENS.radius.lg,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  brandSubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 4,
  },
  fieldGroup: {
    gap: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.lg,
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
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DESIGN_TOKENS.spacing.lg,
    gap: 4,
  },
  registerText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  registerLink: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
