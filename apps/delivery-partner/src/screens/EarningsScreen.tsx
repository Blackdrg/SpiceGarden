import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Animated, Easing } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

interface EarningRecord {
  id: string;
  date: string;
  orders: number;
  amount: number;
  tips: number;
  status: 'completed' | 'pending';
}

export const EarningsScreen = () => {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [totalBalance] = useState(2456);
  
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const mockEarnings: EarningRecord[] = [
        { id: '1', date: 'Mon', orders: 8, amount: 850, tips: 120, status: 'completed' },
        { id: '2', date: 'Tue', orders: 12, amount: 1250, tips: 200, status: 'completed' },
        { id: '3', date: 'Wed', orders: 6, amount: 680, tips: 80, status: 'completed' },
        { id: '4', date: 'Thu', orders: 15, amount: 1560, tips: 250, status: 'completed' },
        { id: '5', date: 'Fri', orders: 10, amount: 1100, tips: 150, status: 'completed' },
        { id: '6', date: 'Sat', orders: 18, amount: 1890, tips: 300, status: 'completed' },
        { id: '7', date: 'Sun', orders: 5, amount: 520, tips: 60, status: 'completed' },
      ];
      setEarnings(mockEarnings);
    } catch {
      console.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, loadEarnings]);

  const maxEarning = Math.max(...earnings.map(e => e.amount));
  const chartData = earnings.slice(-7);

  const renderBar = (value: number, label: string, _index: number) => {
    const height = (value / maxEarning) * 120;
    
    return (
      <View key={_index} style={styles.chartBarContainer}>
        <View style={styles.chartBarWrapper}>
          <View style={[styles.chartBar, { height, backgroundColor: DESIGN_TOKENS.colors.primary }]} />
        </View>
        <Text style={styles.chartLabel}>{label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSubtitle}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{totalBalance}</Text>
        </View>

        <Pressable 
          style={styles.payoutButton}
        >
          <Text style={styles.payoutButtonText}>Request Payout</Text>
          <Text style={styles.payoutIcon}>→</Text>
        </Pressable>

        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((period) => (
            <Pressable
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton
              ]}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.selectedPeriodButtonText
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Earnings</Text>
          <View style={styles.chart}>
            {chartData.map((item, index) => renderBar(item.amount, item.date, index))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{earnings.reduce((sum, e) => sum + e.orders, 0)}</Text>
            <Text style={styles.statText}>Total Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{earnings.reduce((sum, e) => sum + e.tips, 0)}</Text>
            <Text style={styles.statText}>Tips Earned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statText}>Avg Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{Math.round(earnings.reduce((sum, e) => sum + e.amount, 0) / 7)}</Text>
            <Text style={styles.statText}>Daily Avg</Text>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {earnings.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyOrders}>{item.orders} orders</Text>
              </View>
              <View style={styles.historyItemRight}>
                <Text style={styles.historyAmount}>₹{item.amount}</Text>
                <Text style={styles.historyStatus}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    padding: DESIGN_TOKENS.spacing.xl,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerSubtitle: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    marginTop: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN_TOKENS.colors.primary,
    margin: DESIGN_TOKENS.spacing.md,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    gap: 8,
  },
  payoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  payoutIcon: {
    color: 'white',
    fontSize: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: DESIGN_TOKENS.spacing.md,
    gap: 8,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: DESIGN_TOKENS.radius.button,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
  },
  selectedPeriodButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartBarWrapper: {
    height: 120,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  historySection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  historyItemLeft: {},
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  historyOrders: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  historyStatus: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.success,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default EarningsScreen;