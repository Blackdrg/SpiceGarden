import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { Easing } from 'react-native';
import Animated, { useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { safeParse } from '../utils/safe-parse';
import { safeGetItem } from '../utils/secure-storage';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { API_BASE_URL } from '../constants/api';
import { orderService } from '../services/order.service';

async function checkCodRestriction(addressId: string, lat: number, lng: number): Promise<{ codAllowed: boolean; reason?: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/risk/check-address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressId, lat, lng }),
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface AddressEntry {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
}

type CheckoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tracking' | 'Home' | 'Address' | 'Checkout' | 'Auth'>;

type PaymentMethod = 'card' | 'upi' | 'cash';

interface CheckoutScreenProps {
  navigation: CheckoutScreenNavigationProp;
  route?: { params?: { cartItems?: CartItem[]; restaurantId?: string; restaurantName?: string } };
}

interface AddressSectionProps {
  address: string;
  onEdit: () => void;
}

const AddressSection = ({ address, onEdit }: AddressSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Delivery Address</Text>
    <View style={styles.addressRow}>
      <Text style={styles.addressText}>{address}</Text>
      <Pressable style={styles.editButton} accessibilityLabel='Change address' accessibilityRole='button' onPress={onEdit}>
        <Text style={styles.editButtonText}>Change</Text>
      </Pressable>
    </View>
  </View>
);

interface ItemsSectionProps {
  cartItems: CartItem[];
}

const ItemsSection = ({ cartItems }: ItemsSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Items ({cartItems.reduce((sum, i) => sum + i.quantity, 0)})</Text>
    <View style={styles.itemsList}>
      {cartItems.map(item => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemText}>×{item.quantity}</Text>
          <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
        </View>
      ))}
    </View>
  </View>
);

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  codRestricted: boolean;
  codRestrictionReason: string;
}

const PaymentMethodSection = ({ paymentMethod, setPaymentMethod, codRestricted, codRestrictionReason }: PaymentMethodSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Payment Method</Text>
    <View style={styles.paymentOptions}>
      {[
        { key: 'card' as PaymentMethod, label: '₹ Card' },
        { key: 'upi' as PaymentMethod, label: '₹ UPI' },
        { key: 'cash' as PaymentMethod, label: '₹ Cash', disabled: codRestricted },
      ].map((method) => (
        <Pressable
          key={method.key}
          onPress={() => !method.disabled && setPaymentMethod(method.key)}
          style={[
            styles.paymentOption,
            paymentMethod === method.key && styles.selectedPaymentOption,
            method.disabled && styles.disabledPaymentOption,
          ]}
          accessibilityLabel={`Pay with ${method.key}`}
          accessibilityRole='radio'
          accessibilityState={{ checked: paymentMethod === method.key, disabled: method.disabled || false }}
          disabled={method.disabled || false}
        >
          <Text style={[
            styles.paymentOptionText,
            method.disabled && styles.disabledPaymentText,
          ]}>
            {method.label}
          </Text>
        </Pressable>
      ))}
    </View>
    {codRestricted ? (
      <View style={styles.codRestrictionBanner}>
        <Ionicons name="warning" size={16} color={DESIGN_TOKENS.colors.danger} />
        <Text style={styles.codRestrictionText}>{codRestrictionReason}</Text>
      </View>
    ) : null}
  </View>
);

interface TipSectionProps {
  tip: number;
  setTip: (tip: number) => void;
}

const TipSection = ({ tip, setTip }: TipSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Tip</Text>
    <View style={styles.tipOptions}>
      {[0, 30, 50, 100].map(tipAmount => (
        <Pressable
          key={tipAmount}
          onPress={() => setTip(tipAmount)}
          style={[styles.tipOption, tip === tipAmount && styles.selectedTipOption]}
          accessibilityLabel={`Add ₹${tipAmount} tip`}
          accessibilityRole='radio'
          accessibilityState={{ checked: tip === tipAmount }}
        >
          <Text style={styles.tipOptionText}>{tipAmount === 0 ? 'No tip' : `₹${tipAmount}`}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

interface PromoCodeSectionProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  applyPromo: () => void;
  promoError: string;
  promoMessage: string;
}

const PromoCodeSection = ({ promoCode, setPromoCode, applyPromo, promoError, promoMessage }: PromoCodeSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Promo Code</Text>
    <View style={styles.promoRow}>
      <TextInput
        placeholder='Enter promo code'
        value={promoCode}
        onChangeText={setPromoCode}
        style={styles.promoInput}
        accessibilityLabel='Promo code input'
      />
      <Pressable onPress={applyPromo} style={styles.promoButton} accessibilityLabel='Apply promo' accessibilityRole='button'>
        <Text style={styles.promoButtonText}>Apply</Text>
      </Pressable>
    </View>
    {promoError && <Text style={styles.promoError}>{promoError}</Text>}
    {promoMessage && <Text style={styles.promoSuccess}>{promoMessage}</Text>}
  </View>
);

interface OrderSummarySectionProps {
  subtotal: number;
  tip: number;
}

const OrderSummarySection = ({ subtotal, tip }: OrderSummarySectionProps) => {
  const tax = subtotal * 0.05;
  const total = subtotal + 20 + tax + tip;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Item Total</Text>
        <Text style={styles.summaryAmount}>₹{subtotal.toFixed(0)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Fee</Text>
        <Text style={styles.summaryAmount}>₹20</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Taxes</Text>
        <Text style={styles.summaryAmount}>₹{tax.toFixed(0)}</Text>
      </View>
      {tip > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tip</Text>
          <Text style={styles.summaryAmount}>₹{tip}</Text>
        </View>
      )}
      <View style={styles.summaryRowTotal}>
        <Text style={styles.summaryLabelTotal}>Total</Text>
        <Text style={styles.summaryAmountTotal}>₹{total.toFixed(0)}</Text>
      </View>
    </View>
  );
};

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation, route }) => {
  const restaurantId = route?.params?.restaurantId || '';
  const restaurantName = route?.params?.restaurantName || 'Restaurant';
  const [address, setAddress] = useState('');
  const [deliveryAddressId, setDeliveryAddressId] = useState<string | null>(null);
  const [cartItems] = useState<CartItem[]>(route?.params?.cartItems || []);
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [codRestricted, setCodRestricted] = useState(false);
  const [codRestrictionReason, setCodRestrictionReason] = useState('');
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  const runCodCheck = useCallback(async (signal: { cancelled: boolean }) => {
    if (!deliveryAddressId || paymentMethod !== 'cash') {
      setCodRestricted(false);
      setCodRestrictionReason('');
      return;
    }

    try {
      const addressesJson = await safeGetItem(STORAGE_KEYS.ADDRESSES);
      if (signal.cancelled) return;
      const addresses = addressesJson ? (safeParse(addressesJson) as AddressEntry[] | undefined) : undefined;
      const selected = addresses?.find((a) => a.id === deliveryAddressId);
      if (selected?.lat && selected?.lng) {
        const data = await checkCodRestriction(selected.id, selected.lat, selected.lng);
        if (signal.cancelled || !data) return;
        if (!data.codAllowed) {
          setCodRestricted(true);
          setCodRestrictionReason(data.reason || 'COD is not available for this address due to safety restrictions');
          setPaymentMethod('card');
        } else {
          setCodRestricted(false);
          setCodRestrictionReason('');
        }
      }
    } catch {
      /* allow COD by default if check fails */
    }
  }, [deliveryAddressId, paymentMethod]);

  useEffect(() => {
    const signal = { cancelled: false };
    runCodCheck(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [runCodCheck]);

  const loadAddress = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      const [addressesJson, deviceAddress] = await Promise.all([
        safeGetItem(STORAGE_KEYS.ADDRESSES),
        safeGetItem(STORAGE_KEYS.ADDRESS),
      ]);
      if (signal.cancelled) return;
      const addresses = addressesJson ? (safeParse(addressesJson) as AddressEntry[] | undefined) : undefined;
      const selected =
        (Array.isArray(addresses) && (addresses.find((a) => a.isDefault) || addresses[0])) || null;
      if (selected) {
        setDeliveryAddressId(selected.id);
        setAddress(`${selected.label} - ${selected.address}`);
        return;
      }
      if (deviceAddress && deviceAddress.trim().length > 0) {
        setAddress(deviceAddress);
      }
    } catch {
      /* fall through */
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    loadAddress(signal);
    fadeAnim.value = withTiming(1, { duration: 300 });
    return () => {
      signal.cancelled = true;
    };
  }, [loadAddress, fadeAnim]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    scaleAnim.value = withSequence(
      withTiming(1.05, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) })
    );

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax + tip;

    try {
      const userJson = await safeGetItem(STORAGE_KEYS.USER);
      const user = userJson ? (safeParse(userJson) as { id?: string } | undefined) : undefined;
      const userId = (user && (user.id || '')) as string;

      if (!userId) {
        setLoading(false);
        navigation.navigate('Auth');
        return;
      }
      if (!restaurantId) {
        setLoading(false);
        navigation.navigate('Home');
        return;
      }

      const { id } = await orderService.createOrder({
        userId,
        restaurantId,
        restaurantName,
        deliveryAddressId: deliveryAddressId || undefined,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        deliveryFee: 20,
        tax,
        tip,
        grandTotal,
        paymentMethod,
      });

      navigation.navigate('Tracking', { orderId: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not place order';
      setPromoError(message);
      navigation.navigate('Tracking');
    } finally {
      setLoading(false);
    }
  };

  const applyPromo = () => {
    if (promoCode.trim() === '') {
      setPromoError('Enter a promo code');
      setPromoMessage('');
    } else {
      setPromoError('');
      setPromoMessage('Promo applied');
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.primaryButton} accessibilityLabel='Browse Restaurants' accessibilityRole='button'>
          <Text style={styles.primaryButtonText}>Browse Restaurants</Text>
        </Pressable>
      </View>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel='Go back' accessibilityRole='button'>
            <Ionicons name="arrow-back" size={22} color={DESIGN_TOKENS.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerText}>Checkout</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <AddressSection address={address} onEdit={() => navigation.navigate('Address')} />
          <ItemsSection cartItems={cartItems} />
          <PaymentMethodSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} codRestricted={codRestricted} codRestrictionReason={codRestrictionReason} />
          <TipSection tip={tip} setTip={setTip} />
          <PromoCodeSection promoCode={promoCode} setPromoCode={setPromoCode} applyPromo={applyPromo} promoError={promoError} promoMessage={promoMessage} />
          <OrderSummarySection subtotal={subtotal} tip={tip} />
        </ScrollView>
        <Pressable
          onPress={handlePlaceOrder}
          style={[styles.placeOrderButton, loading && styles.buttonLoading]}
          accessibilityLabel='Place your order'
          accessibilityRole='button'
          accessibilityState={{ disabled: loading }}
        >
          <Text style={styles.placeOrderButtonText}>{loading ? 'Processing...' : `Place Order • ₹${(subtotal + subtotal * 0.05 + tip).toFixed(0)}`}</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 20,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  backButtonText: {
    fontSize: 20,
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.sm,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
  },
  addressText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    flex: 1,
    marginRight: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemsList: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: DESIGN_TOKENS.spacing.sm,
  },
  paymentOption: {
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.md,
  },
  selectedPaymentOption: {
    borderColor: DESIGN_TOKENS.colors.primary,
    backgroundColor: `${DESIGN_TOKENS.colors.primary}10`,
  },
  disabledPaymentOption: {
    opacity: 0.4,
  },
  disabledPaymentText: {
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  codRestrictionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
    backgroundColor: `${DESIGN_TOKENS.colors.danger}10`,
    borderRadius: DESIGN_TOKENS.radius.md,
    padding: DESIGN_TOKENS.spacing.sm,
    marginTop: DESIGN_TOKENS.spacing.sm,
    borderWidth: 1,
    borderColor: `${DESIGN_TOKENS.colors.danger}30`,
  },
  codRestrictionText: {
    flex: 1,
    fontSize: 12,
    color: DESIGN_TOKENS.colors.danger,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  paymentOptionText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: DESIGN_TOKENS.spacing.sm,
  },
  tipOption: {
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.md,
  },
  selectedTipOption: {
    borderColor: DESIGN_TOKENS.colors.primary,
    backgroundColor: `${DESIGN_TOKENS.colors.primary}10`,
  },
  tipOptionText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoRow: {
    flexDirection: 'row',
    padding: DESIGN_TOKENS.spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.sm,
    paddingHorizontal: 8,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: DESIGN_TOKENS.radius.sm,
    justifyContent: 'center',
  },
  promoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoError: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoSuccess: {
    color: DESIGN_TOKENS.colors.success,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: 8,
  },
  summaryRowTotal: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryAmountTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  placeOrderButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 16,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  buttonLoading: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default CheckoutScreen;
