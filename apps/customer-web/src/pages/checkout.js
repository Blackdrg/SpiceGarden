"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const ui_1 = require("@spicegarden/ui");
const router_1 = require("next/router");
const react_redux_1 = require("react-redux");
const api_1 = require("@spicegarden/shared/api");
const CheckoutPage = () => {
    const router = (0, router_1.useRouter)();
    const { user } = (0, react_redux_1.useSelector)((state) => state.auth);
    const cartItems = (0, react_redux_1.useSelector)((state) => state.cart.items);
    const restaurantId = (0, react_redux_1.useSelector)((state) => state.cart.restaurantId);
    const [paymentMethod, setPaymentMethod] = (0, react_1.useState)('card');
    const [address, setAddress] = (0, react_1.useState)('Home - Sector 17, Chandigarh');
    const [tip, setTip] = (0, react_1.useState)(0);
    const [promoCode, setPromoCode] = (0, react_1.useState)('');
    const [promoError, setPromoError] = (0, react_1.useState)('');
    const [promoSuccess, setPromoSuccess] = (0, react_1.useState)('');
    const [promoDiscount, setPromoDiscount] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [orderError, setOrderError] = (0, react_1.useState)(''); // New state for order/payment errors
    // Calculate totals from cart items
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 20;
    const taxes = subtotal * 0.05;
    const grandTotal = subtotal + deliveryFee + taxes + tip - promoDiscount;
    const applyPromo = async () => {
        if (!promoCode.trim()) {
            setPromoError('Please enter a promo code');
            return;
        }
        try {
            // Simulate promo validation - in real app this would be an API call
            setPromoError('');
            setPromoSuccess('');
            // Simple simulation: WELCOME50 gives 50% off up to ₹100
            if (promoCode.toUpperCase() === 'WELCOME50') {
                const discount = Math.min(subtotal * 0.5, 100);
                setPromoDiscount(discount);
                setPromoSuccess(`Applied! You saved ₹${discount.toFixed(0)}`);
            }
            else if (promoCode.toUpperCase() === 'SAVE20') {
                const discount = Math.min(subtotal * 0.2, 50);
                setPromoDiscount(discount);
                setPromoSuccess(`Applied! You saved ₹${discount.toFixed(0)}`);
            }
            else {
                setPromoError('Invalid promo code');
                setPromoDiscount(0);
            }
        }
        catch (err) {
            setPromoError('Failed to apply promo code');
            setPromoDiscount(0);
        }
    };
    const handlePlaceOrder = async () => {
        setLoading(true);
        // Reset unknown previous error states
        setPromoError('');
        setPromoSuccess('');
        setOrderError('');
        try {
            // Prepare order data
            const orderData = {
                restaurantId: restaurantId || 'rest-001', // Fallback for demo
                deliveryAddressId: 'addr-001', // In real app, this would come from address selection
                items: cartItems.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal,
                deliveryFee,
                tax: taxes,
                tip,
                grandTotal
            };
            // Try to place order via API
            try {
                const response = await api_1.ordersApi.create(orderData, user?.token || localStorage.getItem('sg_token') || '');
                router.push(`/tracking?order=${response.data.id}`);
            }
            catch (apiError) {
                // Check if it's a payment-related error
                const errorMessage = apiError instanceof Error ? apiError.message : '';
                if (errorMessage.includes('payment') || errorMessage.includes('card') || errorMessage.includes('insufficient')) {
                    // Payment-specific error
                    setOrderError('Payment failed: ' + errorMessage);
                    // Don't proceed to tracking on payment failure
                }
                else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
                    // Auth error - try to refresh token
                    const refreshToken = localStorage.getItem('sg_token');
                    if (refreshToken) {
                        try {
                            const refreshResponse = await api_1.authApi.refreshToken(refreshToken);
                            // Update token in localStorage and state
                            localStorage.setItem('sg_token', refreshResponse.data.access_token);
                            // Retry the order with new token
                            const retryResponse = await api_1.ordersApi.create(orderData, refreshResponse.data.access_token);
                            router.push(`/tracking?order=${retryResponse.data.id}`);
                            return;
                        }
                        catch (refreshError) {
                            // If refresh fails, show auth error
                            setOrderError('Session expired. Please sign in again.');
                            // Redirect to login after a delay
                            setTimeout(() => {
                                router.push('/auth');
                            }, 2000);
                            return;
                        }
                    }
                    else {
                        setOrderError('Session expired. Please sign in again.');
                        setTimeout(() => {
                            router.push('/auth');
                        }, 2000);
                        return;
                    }
                }
                else {
                    // Generic error
                    setOrderError('Order failed: ' + errorMessage);
                }
                // Don't proceed to tracking on error
            }
        }
        catch (err) {
            console.error('Checkout error:', err);
            setOrderError('An unexpected error occurred. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div style={{ padding: ui_1.DESIGN_TOKENS.spacing.md }}>
      <h2 style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.lg }}>Checkout</h2>

      {loading ? (<div style={{ display: 'flex', flexDirection: 'column', gap: ui_1.DESIGN_TOKENS.spacing.lg }}>
          <ui_1.SkeletonCard count={2}/>
          <div style={{ margin: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Payment Method</h3>
            <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm, flexWrap: 'wrap' }}>
              <ui_1.Skeleton width={80} height={20} variant="rectangular" style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}/>
              <ui_1.Skeleton width={80} height={20} variant="rectangular" style={{ marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}/>
              <ui_1.Skeleton width={80} height={20} variant="rectangular"/>
            </div>
          </div>
          <div style={{ margin: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Tip</h3>
            <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <ui_1.Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: ui_1.DESIGN_TOKENS.spacing.sm }}/>
              <ui_1.Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: ui_1.DESIGN_TOKENS.spacing.sm }}/>
              <ui_1.Skeleton width={60} height={20} variant="rectangular" style={{ marginRight: ui_1.DESIGN_TOKENS.spacing.sm }}/>
              <ui_1.Skeleton width={60} height={20} variant="rectangular"/>
            </div>
          </div>
          <div style={{ margin: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Promo Code</h3>
            <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <ui_1.Skeleton width={200} height={20} variant="rectangular" style={{ flex: 1, marginRight: ui_1.DESIGN_TOKENS.spacing.sm }}/>
              <ui_1.Skeleton width={60} height={20} variant="rectangular"/>
            </div>
          </div>
          <ui_1.SkeletonCard count={2}/>
        </div>) : (<>
          <ui_1.Card title="Delivery Address">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0 }}>{address}</p>
              <ui_1.Button label="Change" onClick={() => {
                const newAddress = prompt('Enter your delivery address:', address);
                if (newAddress !== null && newAddress.trim() !== '') {
                    setAddress(newAddress);
                }
            }} variant="secondary"/>
            </div>
          </ui_1.Card>

          <div style={{ margin: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Payment Method</h3>
            <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm, flexWrap: 'wrap' }}>
              <ui_1.Button label="&#x1F4B3; Card" onClick={() => setPaymentMethod('card')} variant={paymentMethod === 'card' ? 'primary' : 'secondary'}/>
              <ui_1.Button label="&#x1F4B0; UPI" onClick={() => setPaymentMethod('upi')} variant={paymentMethod === 'upi' ? 'primary' : 'secondary'}/>
              <ui_1.Button label="&#x1F4B5; Cash" onClick={() => setPaymentMethod('cash')} variant={paymentMethod === 'cash' ? 'primary' : 'secondary'}/>
            </div>
          </div>

          <div style={{ margin: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Tip</h3>
            <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <ui_1.Button label="No tip" onClick={() => setTip(0)} variant={tip === 0 ? 'primary' : 'secondary'}/>
              <ui_1.Button label="&#x20B9;30" onClick={() => setTip(30)} variant={tip === 30 ? 'primary' : 'secondary'}/>
              <ui_1.Button label="&#x20B9;50" onClick={() => setTip(50)} variant={tip === 50 ? 'primary' : 'secondary'}/>
              <ui_1.Button label="&#x20B9;100" onClick={() => setTip(100)} variant={tip === 100 ? 'primary' : 'secondary'}/>
            </div>
          </div>

          <div style={{ margin: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0` }}>
            <h3>Promo Code</h3>
            <div style={{ display: 'flex', gap: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <input type="text" placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} style={{ flex: 1, padding: ui_1.DESIGN_TOKENS.spacing.sm, borderRadius: ui_1.DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}/>
              <ui_1.Button label="Apply" onClick={applyPromo} variant="secondary"/>
            </div>
            {promoError && (<p style={{ color: '#c62828', fontSize: '14px', marginTop: 4 }}>{promoError}</p>)}
            {promoSuccess && (<div style={{ textAlign: 'center', margin: `${ui_1.DESIGN_TOKENS.spacing.lg}px 0` }}>
                 <p style={{ color: '#2e7d32', fontSize: '14px', marginTop: 4 }}>{promoSuccess}</p>
               </div>)}
            {orderError && (<p style={{ color: '#c62828', fontSize: '14px', marginTop: 4 }}>{orderError}</p>)}
          </div>

          <ui_1.Card title="Order Summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}>
              <span>Item Total</span>
              <span>&#8377;{subtotal.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}>
              <span>Delivery Fee</span>
              <span>&#8377;{deliveryFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}>
              <span>Taxes</span>
              <span>&#8377;{taxes.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: ui_1.DESIGN_TOKENS.spacing.xs }}>
              <span>Tip</span>
              <span>&#8377;{tip.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: ui_1.DESIGN_TOKENS.spacing.sm }}>
              <span>Total</span>
              <span>&#8377;{grandTotal.toFixed(0)}</span>
            </div>
          </ui_1.Card>
        </>)}

      <div style={{ marginTop: ui_1.DESIGN_TOKENS.spacing.xl }}>
        <ui_1.Button label={loading ? 'Placing Order...' : 'Place Order'} onClick={handlePlaceOrder}/>
      </div>
    </div>);
};
exports.default = CheckoutPage;
