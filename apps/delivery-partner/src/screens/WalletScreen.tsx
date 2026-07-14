import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/Indicators';
import { deliveryApi } from '../services/delivery-api.service';
import type { EarningsSummary } from '../services/delivery-api.service';
import type { ScreenProps } from '../types';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export default function WalletScreen(_props: ScreenProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await deliveryApi.getEarnings();
        setEarnings(data);
        setTransactions([
          { id: '1', type: 'credit', amount: data.todayEarnings || 0, description: "Today's earnings", date: new Date().toISOString() },
          { id: '2', type: 'credit', amount: data.weeklyEarnings || 0, description: 'This week', date: new Date().toISOString() },
          { id: '3', type: 'credit', amount: data.lifetimeEarnings || 0, description: 'Lifetime earnings', date: new Date().toISOString() },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  const balance = earnings?.availableBalance || 0;

  if (loading) {
    return (
      <Screen title="Wallet" navigation={_props.navigation}>
        <LoadingSpinner label="Loading wallet…" />
      </Screen>
    );
  }

  return (
    <Screen title="Wallet" navigation={_props.navigation}>
      <CardView style={styles.walletBalanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
        <Pressable style={styles.withdrawButton}>
          <Ionicons name="arrow-down-circle-outline" size={18} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.withdrawButtonText}>Withdraw</Text>
        </Pressable>
      </CardView>

      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {error && <ErrorState message={error} />}
        {transactions.length === 0 ? (
          <EmptyState 
            title="No transactions yet" 
            message="Your transaction history will appear here."
          />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <View>
                  <Text style={styles.transactionDesc}>{item.description}</Text>
                  <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.transactionAmount, item.type === 'credit' ? styles.transactionCredit : styles.transactionDebit]}>
                  {item.type === 'credit' ? '+' : '-'}₹{item.amount.toFixed(2)}
                </Text>
              </View>
            )}
          />
        )}
      </View>
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
  transactionSection: {
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  transactionDate: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  transactionCredit: {
    color: DESIGN_TOKENS.colors.success,
  },
  transactionDebit: {
    color: DESIGN_TOKENS.colors.danger,
  },
});
