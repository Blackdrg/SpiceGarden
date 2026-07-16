import React, { useReducer, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS, Skeleton, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi, authApi, addressesApi } from '@spicegarden/shared/api';
import ProtectedRoute from '../components/ProtectedRoute';
import { CreditCardIcon, SmartphoneIcon, BanknoteIcon, TagIcon } from 'lucide-react';
import styles from './checkout.module.css';

interface OrderResponse {
  id: string;
}

interface Address {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

interface CheckoutState {
  paymentMethod: string;
  address: string;
  selectedAddressId: string | null;
  addresses: Address[];
  addressLoading: boolean;
  tip: number;
  promoCode: string;
  promoError: string;
  promoSuccess: string;
  promoDiscount: number;
  loading: boolean;
  orderError: string;
}

const initialCheckoutState: CheckoutState = {
  paymentMethod: 'card',
  address: '',
  selectedAddressId: null,
  addresses: [],
  addressLoading: true,
  tip: 0,
  promoCode: '',
  promoError: '',
  promoSuccess: '',
  promoDiscount: 0,
  loading: false,
  orderError: '',
};

function checkoutReducer(state: CheckoutState, action: { type: string; payload?: unknown }): CheckoutState {
  switch (action.type) {
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload as string };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload as string };
    case 'SET_ADDRESSES': {
      const addresses = action.payload as Address[];
      const preselected = addresses.find((a) => a.isDefault) || addresses[0] || null;
      return {
        ...state,
        addresses,
        addressLoading: false,
        selectedAddressId: preselected ? preselected.id : null,
        address: preselected ? formatAddress(preselected) : '',
      };
    }
    case 'SET_SELECTED_ADDRESS': {
      const id = action.payload as string;
      const selected = state.addresses.find((a) => a.id === id) || null;
      return {
        ...state,
        selectedAddressId: id,
        address: selected ? formatAddress(selected) : '',
      };
    }
    case 'SET_TIP':
      return { ...state, tip: action.payload as number };
    case 'SET_PROMO_CODE':
      return { ...state, promoCode: action.payload as string };
    case 'SET_PROMO_ERROR':
      return { ...state, promoError: action.payload as string };
    case 'SET_PROMO_SUCCESS':
      return { ...state, promoSuccess: action.payload as string };
    case 'SET_PROMO_DISCOUNT':
      return { ...state, promoDiscount: action.payload as number };
    case 'SET_LOADING':
      return { ...state, loading: action.payload as boolean };
    case 'SET_ORDER_ERROR':
      return { ...state, orderError: action.payload as string };
    case 'RESET_PROMO_STATES':
      return { ...state, promoError: '', promoSuccess: '' };
    default:
      return state;
  }
}

function formatAddress(address: Address): string {
  return `${address.label} - ${address.addressLine}, ${address.city}, ${address.state} ${address.postalCode}`;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const restaurantId = useSelector((state: RootState) => state.cart.restaurantId);
  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await addressesApi.list();
        if (!active) return;
        dispatch({ type: 'SET_ADDRESSES', payload: (response.data as Address[]) || [] });
      } catch {
        if (active) dispatch({ type: 'SET_ADDRESSES', payload: [] });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20;
  const taxes = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + taxes + state.tip - state.promoDiscount;

  const applyPromo = async () => {
    if (!state.promoCode.trim()) {
      dispatch({ type: 'SET_PROMO_ERROR', payload: 'Please enter a promo code' });
      return;
    }

    try {
      dispatch({ type: 'SET_PROMO_ERROR', payload: '' });
      dispatch({ type: 'SET_PROMO_SUCCESS', payload: '' });

      if (state.promoCode.toUpperCase() === 'WELCOME50') {
        const discount = Math.min(subtotal * 0.5, 100);
        dispatch({ type: 'SET_PROMO_DISCOUNT', payload: discount });
        dispatch({ type: 'SET_PROMO_SUCCESS', payload: `Applied! You saved ₹${discount.toFixed(0)}` });
      } else if (state.promoCode.toUpperCase() === 'SAVE20') {
        const discount = Math.min(subtotal * 0.2, 50);
        dispatch({ type: 'SET_PROMO_DISCOUNT', payload: discount });
        dispatch({ type: 'SET_PROMO_SUCCESS', payload: `Applied! You saved ₹${discount.toFixed(0)}` });
      } else {
        dispatch({ type: 'SET_PROMO_ERROR', payload: 'Invalid promo code' });
        dispatch({ type: 'SET_PROMO_DISCOUNT', payload: 0 });
      }
    } catch {
      dispatch({ type: 'SET_PROMO_ERROR', payload: 'Failed to apply promo code' });
      dispatch({ type: 'SET_PROMO_DISCOUNT', payload: 0 });
    }
  };

  const handlePlaceOrder = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'RESET_PROMO_STATES' });
    dispatch({ type: 'SET_ORDER_ERROR', payload: '' });

    if (!restaurantId) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_ORDER_ERROR', payload: 'No restaurant selected. Please add items from a restaurant menu.' });
      return;
    }

    if (!state.selectedAddressId) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_ORDER_ERROR', payload: 'Please select a delivery address before placing your order.' });
      return;
    }

    try {
      const orderData = {
        restaurantId,
        deliveryAddressId: state.selectedAddressId,
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        deliveryFee,
        tax: taxes,
        tip: state.tip,
        grandTotal
      };

      try {
        const response = await ordersApi.create(orderData);
        router.push(`/tracking?order=${(response.data as OrderResponse).id}`);
      } catch (apiError: unknown) {
        const errorMessage = apiError instanceof Error ? apiError.message : '';

        if (errorMessage.includes('payment') || errorMessage.includes('card') || errorMessage.includes('insufficient')) {
          dispatch({ type: 'SET_ORDER_ERROR', payload: 'Payment failed: ' + errorMessage });
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          try {
            const refreshResponse = await authApi.refreshToken();
            const retryResponse = await ordersApi.create(orderData);
            router.push(`/tracking?order=${(retryResponse.data as OrderResponse).id}`);
            return;
          } catch {
            dispatch({ type: 'SET_ORDER_ERROR', payload: 'Session expired. Please sign in again.' });
            setTimeout(() => router.push('/auth'), 2000);
            return;
          }
        } else {
          dispatch({ type: 'SET_ORDER_ERROR', payload: 'Order failed: ' + errorMessage });
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      dispatch({ type: 'SET_ORDER_ERROR', payload: 'An unexpected error occurred. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Checkout</h2>
        <p className={styles.pageSubtitle}>Review your order before placing it</p>
      </div>

      {state.loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing[6] }}>
          <SkeletonCard count={2} />
          <Skeleton height={120} borderRadius={DESIGN_TOKENS.radius.xl} />
          <Skeleton height={200} borderRadius={DESIGN_TOKENS.radius.xl} />
        </div>
      ) : (
        <>
          <div className={styles.section}>
            <Card title="Delivery Address" variant="interactive" subtitle={state.address || 'No address selected'}>
              {state.addressLoading ? (
                <Skeleton height={40} borderRadius={DESIGN_TOKENS.radius.lg} />
              ) : state.addresses.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing[3] }}>
                  <p style={{ margin: 0, fontSize: '0.9375rem' }}>No saved addresses found.</p>
                  <Button
                    label="Add Address"
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/addresses')}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing[3] }}>
                  <select
                    aria-label="Select delivery address"
                    value={state.selectedAddressId || ''}
                    onChange={(e) => dispatch({ type: 'SET_SELECTED_ADDRESS', payload: e.target.value })}
                    className={styles.addressSelect}
                  >
                    {state.addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {formatAddress(addr)}
                      </option>
                    ))}
                  </select>
                  <Button
                    label="Manage Addresses"
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/addresses')}
                  />
                </div>
              )}
            </Card>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <CreditCardIcon size={18} color={DESIGN_TOKENS.colors.textSecondary} />
              Payment Method
            </h3>
            <div className={styles.paymentMethods}>
              {[
                { key: 'card', label: 'Card', icon: CreditCardIcon },
                { key: 'upi', label: 'UPI', icon: SmartphoneIcon },
                { key: 'cash', label: 'Cash', icon: BanknoteIcon },
              ].map((method) => (
                <button
                  key={method.key}
                  type="button"
                  className={`${styles.paymentMethodBtn} ${state.paymentMethod === method.key ? styles.paymentMethodBtnActive : ''}`}
                  onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: method.key })}
                >
                  <method.icon size={18} />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Add a Tip</h3>
            <div className={styles.tipOptions}>
              {[0, 30, 50, 100].map((tip) => (
                <button
                  key={tip}
                  type="button"
                  className={`${styles.tipBtn} ${state.tip === tip ? styles.tipBtnActive : ''}`}
                  onClick={() => dispatch({ type: 'SET_TIP', payload: tip })}
                >
                  {tip === 0 ? 'No tip' : `₹${tip}`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <TagIcon size={18} color={DESIGN_TOKENS.colors.textSecondary} />
              Promo Code
            </h3>
            <div className={styles.promoSection}>
              <input
                type="text"
                placeholder="Enter promo code"
                aria-label="Promo code"
                value={state.promoCode}
                onChange={(e) => dispatch({ type: 'SET_PROMO_CODE', payload: e.target.value })}
                className={styles.promoInput}
              />
              <Button label="Apply" onClick={applyPromo} variant="secondary" />
            </div>
            {state.promoError && (
              <p className={styles.promoError}>{state.promoError}</p>
            )}
            {state.promoSuccess && (
              <p className={styles.promoSuccess}>{state.promoSuccess}</p>
            )}
            {state.orderError && (
              <p className={styles.orderError}>{state.orderError}</p>
            )}
          </div>

          <div className={styles.summarySection}>
            <Card title="Order Summary" variant="elevated">
              <div className={styles.summaryRow}>
                <span>Item Total</span>
                <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery Fee</span>
                <span style={{ fontWeight: 600 }}>₹{deliveryFee}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Taxes (5%)</span>
                <span style={{ fontWeight: 600 }}>₹{taxes.toFixed(0)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tip</span>
                <span style={{ fontWeight: 600 }}>₹{state.tip}</span>
              </div>
              {state.promoDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Promo Discount</span>
                  <span style={{ fontWeight: 600, color: DESIGN_TOKENS.colors.success }}>−₹{state.promoDiscount.toFixed(0)}</span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span style={{ color: DESIGN_TOKENS.colors.primary }}>₹{grandTotal.toFixed(0)}</span>
              </div>
            </Card>
          </div>
        </>
      )}

      <div className={styles.placeOrderSection}>
        <Button
          label={state.loading ? 'Placing Order...' : 'Place Order'}
          onClick={handlePlaceOrder}
          fullWidth
          size="lg"
        />
      </div>
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><CheckoutPage {...props} /></ProtectedRoute>;
}
