import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { orderService, Order, formatOrderTotal, formatOrderDate } from '../services/order.service';
import { RootStackParamList } from '../navigation/types';

type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

export const OrderDetailsScreen = () => {
  const route = useRoute<OrderDetailsRouteProp>();
  const navigation = useNavigation<any>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = route.params?.orderId;

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError('Order ID missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.fetchOrderById(String(orderId));
      if (data) {
        setOrder(data);
      } else {
        setError('Order not found');
      }
    } catch {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Order not found'}</Text>
        <Pressable style={styles.retryButton} onPress={loadOrder}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.restaurantName}>{order.restaurantName}</Text>
        <Text style={styles.orderNumber}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryTotal}>{formatOrderTotal(order.total || 0)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order Date</Text>
          <Text style={styles.summaryValue}>{formatOrderDate(order.date)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.trackButton}
          onPress={() => navigation.navigate('Tracking', { orderId: order.id })}
        >
          <Text style={styles.trackButtonText}>Track Order</Text>
        </Pressable>

        <Pressable
          style={styles.reorderButton}
          onPress={async () => {
            const currentCart = await orderService.getCart();
            const updatedCart = await orderService.reorderItems(order.id, currentCart);
            await orderService.saveCart(updatedCart);
            navigation.navigate('Main', { screen: 'Cart' });
          }}
        >
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'delivered':
      return DESIGN_TOKENS.colors.success;
    case 'cancelled':
      return DESIGN_TOKENS.colors.danger;
    case 'preparing':
    case 'ready':
    case 'pickedUp':
      return DESIGN_TOKENS.colors.warning;
    default:
      return DESIGN_TOKENS.colors.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQty: {
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.primary,
    marginRight: 8,
    fontSize: 14,
  },
  itemName: {
    fontSize: 14,
    color: '#343a40',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#212529',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.primary,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  trackButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  reorderButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OrderDetailsScreen;