import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { orderService, Order } from '../services/order.service';
import { RootStackParamList } from '../navigation/types';

type TrackingRouteProp = RouteProp<RootStackParamList, 'Tracking'>;

const STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Your order has been sent to the kitchen' },
  { key: 'preparing', label: 'Preparing', desc: 'The kitchen is preparing your dishes' },
  { key: 'ready', label: 'Ready for Pickup', desc: 'Food is packed and ready' },
  { key: 'pickedUp', label: 'Out for Delivery', desc: 'Driver is on the way to your location' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your meal!' },
];

export const TrackingScreen = () => {
  const route = useRoute<TrackingRouteProp>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedMins, setEstimatedMins] = useState(25);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await orderService.fetchOrderById(String(orderId));
      if (data) {
        setOrder(data);
        switch (data.status) {
          case 'preparing': setEstimatedMins(20); break;
          case 'ready': setEstimatedMins(12); break;
          case 'pickedUp': setEstimatedMins(8); break;
          case 'delivered': setEstimatedMins(0); break;
          default: setEstimatedMins(25);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const getCurrentStepIndex = (): number => {
    if (!order) return 1;
    switch (order.status) {
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'pickedUp': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = getCurrentStepIndex();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.loadingText}>Connecting to tracking feed...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Order Tracking</Text>
        <Text style={styles.orderIdText}>Order #{orderId || order?.id || 'SG-ACTIVE'}</Text>
        {estimatedMins > 0 ? (
          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>Estimated Delivery Time</Text>
            <Text style={styles.etaValue}>{estimatedMins} mins</Text>
          </View>
        ) : (
          <View style={[styles.etaContainer, { backgroundColor: '#e8f5e9' }]}>
            <Text style={[styles.etaValue, { color: DESIGN_TOKENS.colors.success }]}>Delivered</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Progress</Text>
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentStep;
          const isCurrent = idx === currentStep;
          return (
            <View key={step.key} style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepDot, isDone ? styles.stepDotDone : styles.stepDotPending, isCurrent && styles.stepDotCurrent]}>
                  <Text style={[styles.stepDotText, isDone && styles.stepDotTextDone]}>{idx + 1}</Text>
                </View>
                {idx < STEPS.length - 1 && (
                  <View style={[styles.stepLine, idx < currentStep ? styles.stepLineDone : styles.stepLinePending]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>{step.label}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Restaurant Details</Text>
        <Text style={styles.restaurantName}>{order?.restaurantName || 'SpiceGarden Kitchen'}</Text>
        <Text style={styles.restaurantAddress}>Order confirmed and being handled by kitchen staff.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.contactButton}
          onPress={() => Alert.alert('Support', 'Contacting SpiceGarden 24/7 Priority Support hotline.')}
        >
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </Pressable>

        <Pressable
          style={styles.homeButton}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

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
  header: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 14,
  },
  etaContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  etaValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#e65100',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  stepDotPending: {
    backgroundColor: '#e9ecef',
  },
  stepDotCurrent: {
    borderWidth: 2,
    borderColor: '#f04e31',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#adb5bd',
  },
  stepDotTextDone: {
    color: '#fff',
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
  },
  stepLineDone: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  stepLinePending: {
    backgroundColor: '#e9ecef',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  stepLabelDone: {
    color: '#212529',
  },
  stepDesc: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 2,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 13,
    color: '#6c757d',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  contactButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  homeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#495057',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TrackingScreen;