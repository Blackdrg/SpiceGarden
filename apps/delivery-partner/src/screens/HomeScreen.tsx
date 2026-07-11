import React, { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { deliveryApi, type DeliveryOrder } from '../services/delivery-api.service';
import { Screen, CardView, PrimaryButton } from '../components/Screen';
import { EmptyState, LoadingSpinner } from '../components/Indicators';
import type { ScreenProps } from '../types';

export default function HomeScreen({ navigation }: ScreenProps): React.JSX.Element {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

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
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    deliveryApi.connectWebSocket(onReceived);
    return () => {
      active = false;
      deliveryApi.disconnectWebSocket();
    };
  }, [onReceived]);

  const toggleOnline = async () => {
    const next = !online;
    setOnline(next);
    try {
      await deliveryApi.toggleOnline(next);
    } catch {
      /* offline-tolerant */
    }
  };

  const accept = async (order: DeliveryOrder) => {
    try {
      const updated = await deliveryApi.acceptOrder(order.orderId);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      navigation.navigate('OrderDetails', { order: updated });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not accept order.');
    }
  };

  const reject = async (order: DeliveryOrder) => {
    try {
      await deliveryApi.rejectOrder(order.orderId);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading queue…" />;
  }

  return (
    <Screen
      title="Order Queue"
      navigation={navigation}
      right={
        <TouchableOpacity onPress={toggleOnline} style={{ padding: 6 }}>
          <Text style={{ color: online ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.textSecondary, fontWeight: '700' }}>
            {online ? '● Online' : '○ Offline'}
          </Text>
        </TouchableOpacity>
      }
    >
      <CardView>
        <PrimaryButton label={online ? 'Go Offline' : 'Go Online'} onPress={toggleOnline} />
      </CardView>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" message="New assignments will appear here in real time." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => (
            <CardView>
              <Text style={titleStyle}>#{item.orderId.slice(0, 8)} · {item.restaurant.name}</Text>
              <Text style={subStyle}>Pickup: {item.restaurant.address}</Text>
              <Text style={subStyle}>Drop: {item.customer.address}</Text>
              <Text style={subStyle}>₹{item.amount} · {item.distanceKm} km · {item.estimatedTimeMinutes} min</Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity onPress={() => accept(item)} style={acceptStyle}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => reject(item)} style={rejectStyle}>
                  <Text style={{ color: DESIGN_TOKENS.colors.danger, fontWeight: '700' }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </CardView>
          )}
        />
      )}
    </Screen>
  );
}

const titleStyle = { fontSize: 16, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary };
const subStyle = { fontSize: 13, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 2 };
const acceptStyle = {
  backgroundColor: DESIGN_TOKENS.colors.primary,
  paddingVertical: 10,
  paddingHorizontal: 24,
  borderRadius: 8,
  marginRight: 12,
};
const rejectStyle = {
  borderWidth: 1,
  borderColor: DESIGN_TOKENS.colors.danger,
  paddingVertical: 10,
  paddingHorizontal: 24,
  borderRadius: 8,
};
