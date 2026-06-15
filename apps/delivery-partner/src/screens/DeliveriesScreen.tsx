import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Animated, Easing } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

interface DeliveryOrder {
  id: string;
  restaurant: {
    name: string;
    address: string;
    distance: string;
  };
  customer: {
    name: string;
    address: string;
    distance: string;
  };
  amount: number;
  estimatedTime: number;
  createdAt: string;
  status: 'assigned' | 'accepted' | 'pickedUp' | 'onTheWay' | 'delivered';
}

export const DeliveriesScreen = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const mockOrders: DeliveryOrder[] = [
        {
          id: 'ORD-001',
          restaurant: {
            name: 'Burger King',
            address: 'Phase 5, Mohali',
            distance: '2.5 km',
          },
          customer: {
            name: 'Rahul Sharma',
            address: 'Sector 17, Chandigarh',
            distance: '1.2 km',
          },
          amount: 156,
          estimatedTime: 15,
          createdAt: '5 min ago',
          status: 'assigned',
        },
        {
          id: 'ORD-002',
          restaurant: {
            name: 'Pizza Hut',
            address: 'Model Town, Mohali',
            distance: '3.1 km',
          },
          customer: {
            name: 'Priya Verma',
            address: 'Sector 22, Chandigarh',
            distance: '2.8 km',
          },
          amount: 289,
          estimatedTime: 20,
          createdAt: '8 min ago',
          status: 'assigned',
        },
      ];

      setOrders(mockOrders);
    } catch {
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: DESIGN_TOKENS.motion.page,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  const acceptOrder = useCallback(async (orderId: string) => {
    setAcceptingOrderId(orderId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(prev => prev.filter(o => o.id !== orderId));
      Alert.alert('Order Accepted', 'Navigate to restaurant for pickup');
    } catch {
      Alert.alert('Error', 'Failed to accept order');
    } finally {
      setAcceptingOrderId(null);
    }
  }, []);

  const rejectOrder = useCallback((orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => setOrders(prev => prev.filter(o => o.id !== orderId))
        },
      ]
    );
  }, []);

  const renderOrderCard = ({ item }: { item: DeliveryOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{item.estimatedTime} min</Text>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routePoint}>
          <Text style={styles.routeIcon}>🏍</Text>
          <View style={styles.routeDetails}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeName}>{item.restaurant.name}</Text>
            <Text style={styles.routeAddress}>{item.restaurant.address}</Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <Text style={styles.routeIcon}>📍</Text>
          <View style={styles.routeDetails}>
            <Text style={styles.routeLabel}>Delivery</Text>
            <Text style={styles.routeName}>{item.customer.name}</Text>
            <Text style={styles.routeAddress}>{item.customer.address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>₹{item.amount}</Text>
        <View style={styles.orderActions}>
          <Pressable 
            onPress={() => rejectOrder(item.id)}
            style={styles.rejectButton}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </Pressable>
<Pressable 
             onPress={() => acceptOrder(item.id)}
             style={[styles.acceptButton, acceptingOrderId === item.id && styles.acceptingButton]}
           >
             {acceptingOrderId === item.id ? (
               <ActivityIndicator size="small" color="white" />
             ) : (
               <Text style={styles.acceptButtonText}>Accept</Text>
             )}
           </Pressable>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Orders</Text>
          <Text style={styles.headerSubtitle}>{orders.length} orders nearby</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Orders Available</Text>
            <Text style={styles.emptyText}>New orders will appear here when available</Text>
          </View>
        ) : (
<FlatList
             data={orders}
             keyExtractor={(item: DeliveryOrder) => item.id}
             renderItem={renderOrderCard}
             contentContainerStyle={styles.listContent}
           />
        )}
      </View>
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
  loadingText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
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
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  listContent: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  orderCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  timerBadge: {
    backgroundColor: DESIGN_TOKENS.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  timerText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  routeSection: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDetails: {
    flex: 1,
    marginLeft: DESIGN_TOKENS.spacing.sm,
  },
  routeLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    textTransform: 'uppercase',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  routeAddress: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    marginLeft: 7,
    marginVertical: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.border,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: DESIGN_TOKENS.radius.sm,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.danger,
  },
  rejectButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.danger,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  acceptButton: {
    backgroundColor: DESIGN_TOKENS.colors.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: DESIGN_TOKENS.radius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptingButton: {
    opacity: 0.7,
  },
  acceptButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  routeIcon: {
    fontSize: 20,
  },
});

export default DeliveriesScreen;