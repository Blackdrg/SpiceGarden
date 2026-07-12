import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { Screen, CardView, PrimaryButton } from '../components/Screen';
import { LoadingSpinner, ErrorState } from '../components/Indicators';
import { deliveryApi } from '../services/delivery-api.service';
import type { ScreenProps } from '../types';

export default function OrderDetailsScreen({ navigation, route }: ScreenProps): React.JSX.Element {
  const order = route.params.order;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const updated = await deliveryApi.acceptOrder(order.orderId);
      navigation.navigate('Tracking', { order: updated });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept order');
    } finally {
      setLoading(false);
    }
};

  if (!order) {
    return (
      <Screen title="Order Details" navigation={navigation}>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color={DESIGN_TOKENS.colors.textTertiary} />
          <Text style={styles.emptyText}>No order selected</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Order Details" navigation={navigation}>
        <ErrorState message={error} onRetry={() => setError(null)} />
      </Screen>
    );
  }

  return (
    <Screen title="Order Details" navigation={navigation}>
      <CardView style={styles.orderHeaderCard}>
        <View style={styles.orderIdRow}>
          <Ionicons name="receipt-outline" size={18} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.orderId}>Order #{order.orderId.slice(0, 8)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: DESIGN_TOKENS.colors.warningLight }]}>
          <View style={[styles.statusDot, { backgroundColor: DESIGN_TOKENS.colors.warning }]} />
          <Text style={[styles.statusText, { color: DESIGN_TOKENS.colors.warningDark }]}>
            {order.status || 'Assigned'}
          </Text>
        </View>
      </CardView>

      <CardView style={styles.detailCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="cash-outline" size={18} color={DESIGN_TOKENS.colors.success} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>₹{order.amount}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="navigate-outline" size={18} color={DESIGN_TOKENS.colors.info} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{order.distanceKm} km</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="time-outline" size={18} color={DESIGN_TOKENS.colors.warning} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Estimated Time</Text>
            <Text style={styles.detailValue}>{order.estimatedTimeMinutes} mins</Text>
          </View>
        </View>
      </CardView>

      <CardView style={styles.locationCard}>
        <Text style={styles.locationCardTitle}>Locations</Text>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: DESIGN_TOKENS.colors.success }]} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationText}>{order.restaurant.name}</Text>
            <Text style={styles.locationAddress}>{order.restaurant.address}</Text>
          </View>
        </View>
        <View style={styles.locationDivider} />
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: DESIGN_TOKENS.colors.primary }]} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Drop</Text>
            <Text style={styles.locationText}>{order.customer.name}</Text>
            <Text style={styles.locationAddress}>{order.customer.address}</Text>
          </View>
        </View>
      </CardView>

      <PrimaryButton 
        label={loading ? 'Accepting…' : 'Accept Order'} 
        onPress={handleAccept} 
        disabled={loading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.xxl,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  orderId: {
    fontSize: 17,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: DESIGN_TOKENS.radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'capitalize',
  },
  detailCard: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: DESIGN_TOKENS.radius.sm,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  locationCard: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  locationCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: DESIGN_TOKENS.radius.full,
    marginTop: 6,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textTertiary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  locationAddress: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  locationDivider: {
    height: 1,
    backgroundColor: DESIGN_TOKENS.colors.borderLight,
    marginVertical: DESIGN_TOKENS.spacing.md,
    marginLeft: 4,
  },
});
