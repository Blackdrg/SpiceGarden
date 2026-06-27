import React, { useReducer } from 'react';
import { Button, Card, DESIGN_TOKENS, Skeleton, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi, authApi } from '@spicegarden/shared/api';
import ProtectedRoute from '../components/ProtectedRoute';

interface OrderResponse {
  id: string;
}

interface CheckoutState {
  paymentMethod: string;
  address: string;
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
  address: 'Home - Sector 17, Chandigarh',
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

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const restaurantId = useSelector((state: RootState) => state.cart.restaurantId);
  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState);

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

    try {
      const orderData = {
        restaurantId: restaurantId || 'rest-001',
        deliveryAddressId: 'addr-001',
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
    <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
      <h2 style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>Checkout</h2>

      {state.loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.lg }}>
          <SkeletonCard count={2} />
          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Payment Method</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, flexWrap: 'wrap' }}>
              <Skeleton width={80} height={20} variant="rectangular" style={{ marginBottom: DESIGN_TOKENS.spacing.xs }} />
              <Skeleton width={80} height={20} variant="rectangular" style={{ marginBottom: DESIGN_TOKENS.spacing.xs }} />
              <Skeleton width={80} height={20} variant="rectangular" />
            </div>
          </div>
          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Tip</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
              <Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" />
            </div>
          </div>
          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Promo Code</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
              <Skeleton width={200} height={20} variant="rectangular" style={{ flex: 1, marginRight: DESIGN_TOKENS.spacing.sm }} />
              <Skeleton width={60} height={20} variant="rectangular" />
            </div>
          </div>
          <SkeletonCard count={2} />
        </div>
      ) : (
        <>
          <Card title="Delivery Address">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0 }}>{state.address}</p>
              <Button label="Change" onClick={() => {
                const newAddress = prompt('Enter your delivery address:', state.address);
                if (newAddress !== null && newAddress.trim() !== '') {
                  dispatch({ type: 'SET_ADDRESS', payload: newAddress });
                }
              }} variant="secondary" />
            </div>
          </Card>

          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Payment Method</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, flexWrap: 'wrap' }}>
              <Button label="💳 Card" onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: 'card' })} variant={state.paymentMethod === 'card' ? 'primary' : 'secondary'} />
              <Button label="💰 UPI" onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: 'upi' })} variant={state.paymentMethod === 'upi' ? 'primary' : 'secondary'} />
              <Button label="💵 Cash" onClick={() => dispatch({ type: 'SET_PAYMENT_METHOD', payload: 'cash' })} variant={state.paymentMethod === 'cash' ? 'primary' : 'secondary'} />
            </div>
          </div>

          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Tip</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
              <Button label="No tip" onClick={() => dispatch({ type: 'SET_TIP', payload: 0 })} variant={state.tip === 0 ? 'primary' : 'secondary'} />
              <Button label="₹30" onClick={() => dispatch({ type: 'SET_TIP', payload: 30 })} variant={state.tip === 30 ? 'primary' : 'secondary'} />
              <Button label="₹50" onClick={() => dispatch({ type: 'SET_TIP', payload: 50 })} variant={state.tip === 50 ? 'primary' : 'secondary'} />
              <Button label="₹100" onClick={() => dispatch({ type: 'SET_TIP', payload: 100 })} variant={state.tip === 100 ? 'primary' : 'secondary'} />
            </div>
          </div>

          <div style={{ margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Promo Code</h3>
            <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm }}>
              <input
                type="text"
                placeholder="Enter promo code"
                aria-label="Promo code"
                value={state.promoCode}
                onChange={(e) => dispatch({ type: 'SET_PROMO_CODE', payload: e.target.value })}
                style={{ flex: 1, padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
              <Button label="Apply" onClick={applyPromo} variant="secondary" />
            </div>
            {state.promoError && (
              <p style={{ color: '#c62828', fontSize: '14px', marginTop: 4 }}>{state.promoError}</p>
            )}
            {state.promoSuccess && (
              <div style={{ textAlign: 'center', margin: `${DESIGN_TOKENS.spacing.lg}px 0` }}>
                <p style={{ color: '#2e7d32', fontSize: '14px', marginTop: 4 }}>{state.promoSuccess}</p>
              </div>
            )}
            {state.orderError && (
              <p style={{ color: '#c62828', fontSize: '14px', marginTop: 4 }}>{state.orderError}</p>
            )}
          </div>

          <Card title="Order Summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
              <span>Item Total</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
              <span>Taxes</span>
              <span>₹{taxes.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: DESIGN_TOKENS.spacing.xs }}>
              <span>Tip</span>
              <span>₹{state.tip.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: DESIGN_TOKENS.spacing.sm }}>
              <span>Total</span>
              <span>₹{grandTotal.toFixed(0)}</span>
            </div>
          </Card>
        </>
      )}

      <div style={{ marginTop: DESIGN_TOKENS.spacing.xl }}>
        <Button label={state.loading ? 'Placing Order...' : 'Place Order'} onClick={handlePlaceOrder} />
      </div>
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><CheckoutPage {...props} /></ProtectedRoute>;
}