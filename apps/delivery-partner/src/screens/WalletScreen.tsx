import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { EmptyState } from '../components/Indicators';
import type { ScreenProps } from '../types';

export default function WalletScreen(_props: ScreenProps): React.JSX.Element {
  return (
    <Screen title="Wallet" navigation={_props.navigation}>
      <CardView style={styles.walletBalanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceAmount}>₹0.00</Text>
        <Pressable style={styles.withdrawButton}>
          <Ionicons name="arrow-down-circle-outline" size={18} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.withdrawButtonText}>Withdraw</Text>
        </Pressable>
      </CardView>
      <EmptyState 
        title="No transactions yet" 
        message="Your transaction history will appear here."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  walletBalanceCard: {
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
    fontSize: 32,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    marginTop: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignSelf: 'flex-start',
  },
  withdrawButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
