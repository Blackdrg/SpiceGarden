import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Text, Pressable, View, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import { deliveryApi, type DeliveryOrder } from '../services/delivery-api.service';
import { Screen, CardView, PrimaryButton } from '../components/Screen';
import { EmptyState, LoadingSpinner, ErrorState } from '../components/Indicators';
import type { ScreenProps } from '../types';

const StatusChip = ({ online }: { online: boolean }) => (
  <View style={[
    styles.statusChip,
    online ? styles.statusChipOnline : styles.statusChipOffline,
  ]}>
    <View style={[
      styles.statusDot,
      online ? styles.statusDotOnline : styles.statusDotOffline,
    ]} />
    <Text style={[
      styles.statusText,
      online ? styles.statusTextOnline : styles.statusTextOffline,
    ]}>
      {online ? 'Online' : 'Offline'}
    </Text>
  </View>
);

export default function HomeScreen({ navigation }: ScreenProps): React.JSX.Element {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onReceived = useCallback((order: DeliveryOrder) => {
    setOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [...prev, order]));
  }, []);

  useEffect(() => {
    let active = true;
    deliveryApi
      .getProfile()
      .then((p) => {
        if (active) setOnline(p.isOnline);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load profile');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    deliveryApi.connectWebSocket(onReceived);
    return () => {
      active = false;
      deliveryApi.disconnectWebSocket();
    };
  }, [onReceived]);

  const toggleOnline = useCallback(async () => {
    const next = !online;
    setOnline(next);
    try {
      await deliveryApi.toggleOnline(next);
    } catch {
      /* offline-tolerant */
    }
  }, [online]);

  const accept = useCallback(async (order: DeliveryOrder) => {
    try {
      const updated = await deliveryApi.acceptOrder(order.orderId);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      navigation.navigate('OrderDetails', { order: updated });
    } catch (e) {
      console.error('Accept order error:', e);
    }
  }, [navigation]);

  const reject = useCallback(async (order: DeliveryOrder) => {
    try {
      await deliveryApi.rejectOrder(order.orderId);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch {
      /* ignore */
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: DeliveryOrder }) => (
    <CardView style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Ionicons name="receipt-outline" size={16} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.orderId}>#{item.orderId.slice(0, 8)}</Text>
        </View>
        <View style={styles.amountBadge}>
          <Text style={styles.orderAmount}>₹{item.amount}</Text>
        </View>
      </View>
      <View style={styles.orderContent}>
        <View style={styles.orderLocationRow}>
          <View style={styles.locationDotContainer}>
            <View style={[styles.locationDot, styles.pickupDot]} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationText}>{item.restaurant.name}</Text>
            <Text style={styles.locationAddress}>{item.restaurant.address}</Text>
          </View>
        </View>
        <View style={styles.orderLocationRow}>
          <View style={styles.locationDotContainer}>
            <View style={[styles.locationDot, styles.dropDot]} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Drop</Text>
            <Text style={styles.locationText}>{item.customer.address}</Text>
          </View>
        </View>
      </View>
      <View style={styles.orderMeta}>
        <View style={styles.metaChip}>
          <Ionicons name="navigate-outline" size={14} color={DESIGN_TOKENS.colors.textSecondary} />
          <Text style={styles.metaText}>{item.distanceKm} km</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="time-outline" size={14} color={DESIGN_TOKENS.colors.textSecondary} />
          <Text style={styles.metaText}>{item.estimatedTimeMinutes} min</Text>
        </View>
      </View>
      <View style={styles.orderActions}>
                <Pressable onPress={() => accept(item)} style={styles.acceptButton}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
                <Pressable onPress={() => reject(item)} style={styles.rejectButton}>
          <Ionicons name="close" size={18} color={DESIGN_TOKENS.colors.danger} />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </CardView>
  ), [accept, reject]);

  if (loading) {
    return <LoadingSpinner label="Loading queue…" />;
  }

  if (error) {
    return (
      <Screen title="Order Queue" navigation={navigation}>
        <ErrorState message={error} onRetry={() => { setError(null); setLoading(true); }} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Order Queue"
      navigation={navigation}
      right={
        <Pressable onPress={toggleOnline} style={styles.statusToggle}>
          <StatusChip online={online} />
        </TouchableOpacity>
      }
    >
      <CardView>
        <PrimaryButton label={online ? 'Go Offline' : 'Go Online'} onPress={toggleOnline} />
      </CardView>
      {orders.length === 0 ? (
        <EmptyState 
          title="No orders yet" 
          message="New assignments will appear here in real time."
          actionLabel={online ? 'Wait for orders' : 'Go online to receive orders'}
          onAction={toggleOnline}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: DESIGN_TOKENS.spacing.xl }}
        />
      )}
    </Screen>
  );
}

const onlineColor = DESIGN_TOKENS.colors.success;
const offlineColor = DESIGN_TOKENS.colors.textTertiary;

const styles = StyleSheet.create({
  statusToggle: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.full,
    gap: DESIGN_TOKENS.spacing.xs,
  },
  statusChipOnline: {
    backgroundColor: DESIGN_TOKENS.colors.successLight,
  },
  statusChipOffline: {
    backgroundColor: DESIGN_TOKENS.colors.elevated,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: DESIGN_TOKENS.radius.full,
  },
  statusDotOnline: {
    backgroundColor: DESIGN_TOKENS.colors.success,
    ...DESIGN_TOKENS.shadows.small,
  },
  statusDotOffline: {
    backgroundColor: DESIGN_TOKENS.colors.textTertiary,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statusTextOnline: {
    color: DESIGN_TOKENS.colors.successDark,
  },
  statusTextOffline: {
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  orderCard: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  amountBadge: {
    backgroundColor: DESIGN_TOKENS.colors.primaryLight,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderContent: {
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  orderLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DESIGN_TOKENS.spacing.sm,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  locationDotContainer: {
    paddingTop: 2,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: DESIGN_TOKENS.radius.full,
  },
  pickupDot: {
    backgroundColor: DESIGN_TOKENS.colors.success,
  },
  dropDot: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  locationTextContainer: {
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
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  locationAddress: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    marginTop: 2,
  },
  orderMeta: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.md,
    paddingTop: DESIGN_TOKENS.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.borderLight,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  metaText: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderActions: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.radius.button,
    ...DESIGN_TOKENS.shadows.small,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_TOKENS.spacing.xs,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.radius.button,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.danger,
    backgroundColor: DESIGN_TOKENS.colors.dangerLight + '40',
  },
  rejectButtonText: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});
