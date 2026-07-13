import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView } from '../components/Screen';
import { ErrorState, EmptyState } from '../components/Indicators';
import type { ScreenProps } from '../types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return DESIGN_TOKENS.colors.success;
    case 'cancelled':
      return DESIGN_TOKENS.colors.danger;
    default:
      return DESIGN_TOKENS.colors.textSecondary;
  }
};

export default function HistoryScreen(_props: ScreenProps): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ orderId: string; restaurant: string; amount: number; date: string; status: string }[]>([]);

  if (error) {
    return (
      <Screen title="History" navigation={_props.navigation}>
        <ErrorState message={error} />
      </Screen>
    );
  }

  return (
    <Screen title="History" navigation={_props.navigation}>
      {history.length === 0 ? (
        <EmptyState 
          title="No delivery history" 
          message="Your past deliveries will appear here."
        />
      ) : (
        history.map((item) => (
          <CardView key={item.orderId} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.historyOrderId}>
                <Ionicons name="receipt-outline" size={16} color={DESIGN_TOKENS.colors.primary} />
                <Text style={styles.historyIdText}>{item.orderId}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.historyRestaurant}>{item.restaurant}</Text>
            <View style={styles.historyFooter}>
              <Text style={styles.historyAmount}>₹{item.amount}</Text>
              <View style={styles.historyDateContainer}>
                <Ionicons name="time-outline" size={14} color={DESIGN_TOKENS.colors.textTertiary} />
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
            </View>
          </CardView>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  historyOrderId: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  historyIdText: {
    fontSize: 14,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statusBadge: {
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  historyRestaurant: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: DESIGN_TOKENS.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.borderLight,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  historyDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  historyDate: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textTertiary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
