import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
import styles from './index.module.css';

const TIPS = [0, 20, 30, 50];

const CartPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [selectedTip, setSelectedTip] = useState(20);

  const itemTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = itemTotal > 299 ? 0 : 25;
  const taxes = Math.round(itemTotal * 0.05);

  let discount = 0;
  if (appliedPromo === 'WELCOME50') {
    discount = Math.min(Math.round(itemTotal * 0.5), 150);
  } else if (appliedPromo === 'SPICE20') {
    discount = Math.round(itemTotal * 0.2);
  }

  const grandTotal = Math.max(itemTotal + deliveryFee + taxes + selectedTip - discount, 0);

  const handleApplyPromo = () => {
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME50' || code === 'SPICE20') {
      setAppliedPromo(code);
      setPromoCode('');
    } else {
      setPromoError('Invalid coupon code. Try WELCOME50');
    }
  };

  const handleProceedToCheckout = () => {
    const orderSummary = {
      items: cartItems,
      itemTotal,
      deliveryFee,
      taxes,
      tip: selectedTip,
      discount,
      grandTotal,
      promoCode: appliedPromo,
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_order_summary', JSON.stringify(orderSummary));
    }
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{ fontWeight: 700, color: '#FF5A1F', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Back to Home
          </button>
        </header>

        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', marginTop: 20 }}>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>🛒</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Your Cart is Empty</h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 24 }}>
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              padding: '12px 28px',
              background: '#FF5A1F',
              color: '#FFFFFF',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 2px 10px rgba(255,90,31,0.35)',
            }}
          >
            Explore Restaurants & Dishes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Cart Header */}
      <header className={styles.header}>
        <button
          type="button"
          onClick={() => router.push('/')}
          style={{ fontWeight: 700, color: '#FF5A1F', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← Continue Shopping
        </button>
        <h1 className={styles.userName} style={{ fontSize: '1.25rem' }}>
          My Order Cart ({cartItems.length})
        </h1>
      </header>

      {/* Cart Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                {item.name}
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                ₹{item.price} each • <strong style={{ color: '#0F172A' }}>₹{item.price * item.quantity}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F1F5F9',
                  borderRadius: 9999,
                  padding: '4px 8px',
                  gap: 10,
                  border: '1px solid #E2E8F0',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (item.quantity <= 1) dispatch(removeFromCart(item.id));
                    else dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                  }}
                  style={{ color: '#0F172A', fontWeight: 800, width: 22, height: 22 }}
                >
                  −
                </button>
                <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                  style={{ color: '#FF5A1F', fontWeight: 800, width: 22, height: 22 }}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => dispatch(removeFromCart(item.id))}
                style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600, padding: '4px 6px' }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons Section */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #E2E8F0',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
          🎟️ Apply Coupons & Offers
        </div>
        {appliedPromo ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: 10, border: '1px solid #10B981' }}>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.875rem' }}>
              ✓ "{appliedPromo}" Applied (Saved ₹{discount})
            </span>
            <button
              type="button"
              onClick={() => setAppliedPromo(null)}
              style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.8125rem' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code (e.g. WELCOME50)"
              aria-label="Enter coupon promo code"
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
              }}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              style={{
                padding: '10px 20px',
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              Apply
            </button>
          </div>
        )}
        {promoError && (
          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 6, fontWeight: 600 }}>
            {promoError}
          </div>
        )}
      </div>

      {/* Tip Delivery Partner */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #E2E8F0',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
          🛵 Delivery Partner Tip
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {TIPS.map((tip) => (
            <button
              key={tip}
              type="button"
              onClick={() => setSelectedTip(tip)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: '0.8125rem',
                fontWeight: 700,
                border: selectedTip === tip ? '1.5px solid #FF5A1F' : '1px solid #E2E8F0',
                background: selectedTip === tip ? 'rgba(255, 90, 31, 0.1)' : '#F8FAFC',
                color: selectedTip === tip ? '#FF5A1F' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {tip === 0 ? 'No Tip' : `₹${tip}`}
            </button>
          ))}
        </div>
      </div>

      {/* Bill Breakdown */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          border: '1px solid #E2E8F0',
          marginBottom: 24,
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
          Bill Details
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem', color: '#475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Item Total</span>
            <span>₹{itemTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? <strong style={{ color: '#10B981' }}>FREE</strong> : `₹${deliveryFee}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Govt Taxes & Packaging (5%)</span>
            <span>₹{taxes}</span>
          </div>
          {selectedTip > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Tip</span>
              <span>₹{selectedTip}</span>
            </div>
          )}
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 700 }}>
              <span>Promo Discount</span>
              <span>−₹{discount}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.125rem',
              fontWeight: 800,
              color: '#0F172A',
              paddingTop: 12,
              marginTop: 6,
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <span>To Pay</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        type="button"
        onClick={handleProceedToCheckout}
        style={{
          width: '100%',
          padding: '16px',
          background: '#FF5A1F',
          color: '#FFFFFF',
          borderRadius: 14,
          fontWeight: 800,
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(255, 90, 31, 0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        Proceed to Checkout (₹{grandTotal}) →
      </button>
    </div>
  );
};

export default CartPage;
