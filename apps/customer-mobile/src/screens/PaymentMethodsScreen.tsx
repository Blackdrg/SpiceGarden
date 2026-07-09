import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { API_URL } from '../constants/api';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  upiId?: string;
  walletProvider?: string;
  isDefault: boolean;
}

const PaymentMethodIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'card':
      return <Ionicons name="card" size={24} color={DESIGN_TOKENS.colors.primary} />;
    case 'upi':
      return <Ionicons name="cash" size={24} color={DESIGN_TOKENS.colors.primary} />;
    case 'wallet':
      return <Ionicons name="wallet" size={24} color={DESIGN_TOKENS.colors.primary} />;
    default:
      return <Ionicons name="card" size={24} color={DESIGN_TOKENS.colors.primary} />;
  }
};

const PaymentMethodDetails = ({ method }: { method: PaymentMethod }) => {
  switch (method.type) {
    case 'card':
      return `${method.cardBrand || 'Card'} •••• ${method.cardLast4 || 'XXXX'}`;
    case 'upi':
      return `${method.upiId || 'UPI ID'}`;
    case 'wallet':
      return `${method.walletProvider || 'Wallet'}`;
    default:
      return method.type;
  }
};

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/user/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPaymentMethods(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fetchPaymentMethods, fadeAnim]);

  const handleDeletePaymentMethod = useCallback(async (id: string) => {
    try {
      setActionLoading(id);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`${API_URL}/user/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show('Payment method deleted', { duration: Toast.durations.SHORT });
        fetchPaymentMethods();
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show('Failed to delete payment method', { duration: Toast.durations.SHORT });
    } finally {
      setActionLoading(null);
    }
  }, [fetchPaymentMethods]);

  const handleSetDefault = useCallback(async (id: string) => {
    try {
      setActionLoading(id);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`${API_URL}/user/payment-methods/${id}/set-default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchPaymentMethods();
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionLoading(null);
    }
  }, [fetchPaymentMethods]);

  const handleAddPaymentMethod = () => {
    Haptics.selectionAsync();
    navigation.navigate('AddPaymentMethod' as never);
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerText}>Payment Methods</Text>
        </View>

        <View style={styles.content}>
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={64} color={DESIGN_TOKENS.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptySubtitle}>Add a payment method to make checkout faster</Text>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodInfo}>
                <PaymentMethodIcon type={method.type} />
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodTitle}>
                    {method.type === 'card' ? 'Card' : method.type === 'upi' ? 'UPI' : 'Wallet'}
                  </Text>
                  <Text style={styles.paymentMethodSubtitle}><PaymentMethodDetails method={method} /></Text>
                </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.paymentMethodActions}>
                  {!method.isDefault && (
                    <Pressable 
                      onPress={() => handleSetDefault(method.id)}
                      style={styles.actionButton}
                      disabled={actionLoading !== null}
                    >
                      <Text style={styles.actionButtonText}>Set Default</Text>
                    </Pressable>
                  )}
                  <Pressable 
                    onPress={() => handleDeletePaymentMethod(method.id)}
                    style={styles.deleteButton}
                    disabled={actionLoading !== null}
                  >
                    <Ionicons name="trash" size={20} color={DESIGN_TOKENS.colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <Pressable 
          onPress={handleAddPaymentMethod}
          style={styles.addButton}
          accessibilityLabel="Add payment method"
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={24} color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  content: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginTop: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptySubtitle: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: DESIGN_TOKENS.spacing.xs,
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  paymentMethodCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodDetails: {
    flex: 1,
    marginLeft: DESIGN_TOKENS.spacing.md,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 2,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  defaultBadge: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  actionButton: {
    marginRight: DESIGN_TOKENS.spacing.md,
  },
  actionButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  deleteButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    margin: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.primary,
  },
  addButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default PaymentMethodsScreen;
