import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { LoadingSpinner, ErrorState } from '../components/Indicators';
import { deliveryApi } from '../services/delivery-api.service';
import type { ScreenProps } from '../types';

export default function EarningsScreen(_props: ScreenProps): React.JSX.Element {
  const [state, setState] = useState<{ earnings: { availableBalance: number; pendingBalance: number; lifetimeEarnings: number; weeklyEarnings: number; todayEarnings: number } | null; loading: boolean; error: string | null }>({ earnings: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    deliveryApi.getEarnings().then((data) => {
      if (active) {
        setState({ earnings: data, loading: false, error: null });
      }
    }).catch((e) => {
      if (active) {
        setState({ earnings: { availableBalance: 0, pendingBalance: 0, lifetimeEarnings: 0, weeklyEarnings: 0, todayEarnings: 0 }, loading: false, error: e instanceof Error ? e.message : 'Failed to load earnings' });
      }
    });
    return () => { active = false; };
  }, []);

  if (state.loading) {
    return (
      <Screen title="Earnings" navigation={_props.navigation}>
        <LoadingSpinner label="Loading earnings…" />
      </Screen>
    );
  }

  if (state.error) {
    return (
      <Screen title="Earnings" navigation={_props.navigation}>
        <ErrorState message={state.error} />
      </Screen>
    );
  }

  const statCards = [
    { label: "Today's Earnings", value: `₹${state.earnings?.todayEarnings.toFixed(2)}`, icon: 'today', color: DESIGN_TOKENS.colors.primary },
    { label: 'Weekly Earnings', value: `₹${state.earnings?.weeklyEarnings.toFixed(2)}`, icon: 'calendar-outline', color: DESIGN_TOKENS.colors.info },
    { label: 'Lifetime Earnings', value: `₹${state.earnings?.lifetimeEarnings.toFixed(2)}`, icon: 'trophy-outline', color: DESIGN_TOKENS.colors.premium },
    { label: 'Pending Balance', value: `₹${state.earnings?.pendingBalance.toFixed(2)}`, icon: 'time-outline', color: DESIGN_TOKENS.colors.warning },
  ];

  return (
    <Screen title="Earnings" navigation={_props.navigation}>
      <CardView style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹{state.earnings?.availableBalance.toFixed(2)}</Text>
        <View style={styles.balanceActionRow}>
          <View style={styles.balanceChip}>
            <Ionicons name="cash-outline" size={16} color={DESIGN_TOKENS.colors.success} />
            <Text style={styles.balanceChipText}>Ready to withdraw</Text>
          </View>
        </View>
      </CardView>

      <View style={styles.statsGrid}>
        {statCards.map((stat) => (
          <CardView key={stat.label} style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: stat.color + '15' }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </CardView>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.borderLight,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  balanceActionRow: {
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    backgroundColor: DESIGN_TOKENS.colors.successLight,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.full,
    alignSelf: 'flex-start',
  },
  balanceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.successDark,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statsGrid: {
    gap: DESIGN_TOKENS.spacing.sm,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_TOKENS.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
