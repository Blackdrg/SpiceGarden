import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import type { ScreenProps } from '../types';

export default function SplashScreen(_props: ScreenProps): React.JSX.Element {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: DESIGN_TOKENS.colors.background,
      padding: DESIGN_TOKENS.spacing.xl,
    }}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="car" size={40} color={DESIGN_TOKENS.colors.primary} />
        </View>
        <Text style={styles.brandText}>SpiceGarden</Text>
        <Text style={styles.brandSubtext}>Partner</Text>
      </View>
      <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      <Text style={styles.loadingText}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: DESIGN_TOKENS.radius.lg,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.medium,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  brandSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 4,
  },
  loadingText: {
    marginTop: DESIGN_TOKENS.spacing.md,
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
