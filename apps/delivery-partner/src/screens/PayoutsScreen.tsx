import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { LoadingSpinner, ErrorState } from '../components/Indicators';
import { deliveryApi } from '../services/delivery-api.service';
import type { ScreenProps } from '../types';

export default function PayoutsScreen(_props: ScreenProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    deliveryApi.getEarnings().catch((e) => {
      setError(e instanceof Error ? e.message : 'Failed to load payouts');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Screen title="Payouts" navigation={_props.navigation}>
        <LoadingSpinner label="Loading payouts…" />
      </Screen>
    );
  }

  return (
    <Screen title="Payouts" navigation={_props.navigation}>
      <CardView style={styles.payoutSummaryCard}>
        <View style={styles.payoutRow}>
          <View style={styles.payoutIconContainer}>
            <Ionicons name="wallet-outline" size={24} color={DESIGN_TOKENS.colors.primary} />
          </View>
          <View style={styles.payoutInfo}>
            <Text style={styles.payoutLabel}>Next Payout</Text>
            <Text style={styles.payoutAmount}>₹0.00</Text>
          </View>
        </View>
        <Text style={styles.payoutNote}>Payouts are processed weekly on Fridays.</Text>
      </CardView>
      {error && <ErrorState message={error} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  payoutSummaryCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.md,
  },
  payoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: DESIGN_TOKENS.radius.lg,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutInfo: {
    flex: 1,
  },
  payoutLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payoutAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  payoutNote: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: DESIGN_TOKENS.spacing.md,
    lineHeight: 18,
  },
});
