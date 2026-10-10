import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { clearCart } from '../redux/slices/cartSlice';
import { MapPin, CreditCard, ChevronLeft, ArrowRight, ShieldCheck, Tag, Sparkles, CheckCircle2 } from 'lucide-react';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const restaurantName = 'SpiceGarden Signature Kitchen';
  
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [address, setAddress] = useState('Flat 402, Royal Palms, Sector 17, Chandigarh - 160017');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'wallet'>('upi');
  const [tip, setTip] = useState<number>(30);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback demo items if cart is opened directly
  const displayItems = cartItems.length > 0 ? cartItems : [
    { id: 'item-1', name: 'Butter Chicken Biryani Bowl', price: 299, quantity: 2 },
    { id: 'item-2', name: 'Garlic Butter Naan', price: 65, quantity: 3 },
  ];

  const subtotal = displayItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 499 ? 0 : 35;
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(0, subtotal + deliveryFee + taxes + tip - discount);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME50') {
      const disc = Math.min(Math.round(subtotal * 0.5), 150);
      setDiscount(disc);
      setAppliedPromo('WELCOME50');
      setPromoMessage({ type: 'success', text: `🎉 WELCOME50 applied! You saved ₹${disc}` });
    } else if (cleanCode === 'SAVE100') {
      if (subtotal >= 499) {
        setDiscount(100);
        setAppliedPromo('SAVE100');
        setPromoMessage({ type: 'success', text: '🎉 SAVE100 applied! You saved ₹100' });
      } else {
        setPromoMessage({ type: 'error', text: 'SAVE100 requires minimum order of ₹499' });
      }
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid coupon code' });
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    
    // Generate order ID
    const newOrderId = `SG-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Store in session storage
    const orderData = {
      id: newOrderId,
      restaurant: restaurantName,
      items: displayItems,
      subtotal,
      deliveryFee,
      tax: taxes,
      tip,
      discount,
      total: grandTotal,
      paymentMethod,
      address,
      createdAt: new Date().toISOString(),
      status: 'preparing',
    };
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lastOrderId', newOrderId);
      sessionStorage.setItem(`order_${newOrderId}`, JSON.stringify(orderData));
    }

    // Clear cart in redux
    dispatch(clearCart());

    // Small delay to simulate processing & redirect
    setTimeout(() => {
      router.push(`/tracking?order=${newOrderId}`);
    }, 800);
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Checkout | SpiceGarden</title>
      </Head>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
            <ChevronLeft size={20} color="#334155" />
          </button>
          <div>
            <h1 className={styles.title}>Review &amp; Place Order</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{restaurantName}</p>
          </div>
        </div>

        {/* Address Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <MapPin size={18} color="#ff5a1f" /> Delivery Address
            </h2>
            <button
              type="button"
              className={styles.changeBtn}
              onClick={() => {
                const updated = prompt('Enter delivery address:', address);
                if (updated && updated.trim()) setAddress(updated);
              }}
            >
              Change
            </button>
          </div>
          <p className={styles.addressText}>{address}</p>
          <div className={styles.addressPresets}>
            <button
              type="button"
              className={`${styles.presetChip} ${addressType === 'home' ? styles.presetChipActive : ''}`}
              onClick={() => { setAddressType('home'); setAddress('Flat 402, Royal Palms, Sector 17, Chandigarh - 160017'); }}
            >
              🏠 Home
            </button>
            <button
              type="button"
              className={`${styles.presetChip} ${addressType === 'work' ? styles.presetChipActive : ''}`}
              onClick={() => { setAddressType('work'); setAddress('Tower B, Tech Hub, Phase 8, Mohali - 160071'); }}
            >
              💼 Work
            </button>
            <button
              type="button"
              className={`${styles.presetChip} ${addressType === 'other' ? styles.presetChipActive : ''}`}
              onClick={() => { setAddressType('other'); setAddress('Green Avenue, Sector 35, Chandigarh'); }}
            >
              📍 Other
            </button>
          </div>
        </div>

        {/* Order Items Overview */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={18} color="#ff5a1f" /> Order Items ({displayItems.length})
            </h2>
            <button type="button" className={styles.changeBtn} onClick={() => router.push('/cart')}>
              Edit Cart
            </button>
          </div>
          <div className={styles.cartSummaryList}>
            {displayItems.map((item) => (
              <div key={item.id} className={styles.cartItemRow}>
                <div className={styles.cartItemName}>
                  <span className={styles.cartItemQty}>{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
                <span className={styles.cartItemPrice}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Code Card */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>
            <Tag size={18} color="#ff5a1f" /> Coupons &amp; Offers
          </h2>
          <div className={styles.promoInputWrapper}>
            <input
              type="text"
              placeholder="ENTER PROMO CODE"
              className={styles.promoInput}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button
              type="button"
              className={styles.applyBtn}
              onClick={() => applyCoupon(promoCode)}
            >
              Apply
            </button>
          </div>
          <div className={styles.promoPills}>
            <button type="button" className={styles.promoPill} onClick={() => { setPromoCode('WELCOME50'); applyCoupon('WELCOME50'); }}>
              WELCOME50 (50% OFF)
            </button>
            <button type="button" className={styles.promoPill} onClick={() => { setPromoCode('SAVE100'); applyCoupon('SAVE100'); }}>
              SAVE100 (₹100 OFF)
            </button>
          </div>
          {promoMessage && (
            <p className={promoMessage.type === 'success' ? styles.promoSuccess : styles.promoError}>
              {promoMessage.text}
            </p>
          )}
        </div>

        {/* Payment Method Card */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>
            <CreditCard size={18} color="#ff5a1f" /> Payment Method
          </h2>
          <div className={styles.paymentGrid}>
            <div
              className={`${styles.paymentOption} ${paymentMethod === 'upi' ? styles.paymentOptionActive : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <div style={{ fontSize: 22 }}>⚡</div>
              <div>
                <p className={styles.paymentOptionTitle}>UPI (GPay / PhonePe)</p>
                <p className={styles.paymentOptionSub}>Instant &amp; 0% Fee</p>
              </div>
            </div>
            <div
              className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentOptionActive : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <div style={{ fontSize: 22 }}>💳</div>
              <div>
                <p className={styles.paymentOptionTitle}>Credit / Debit Card</p>
                <p className={styles.paymentOptionSub}>Visa, MC, Rupay</p>
              </div>
            </div>
            <div
              className={`${styles.paymentOption} ${paymentMethod === 'wallet' ? styles.paymentOptionActive : ''}`}
              onClick={() => setPaymentMethod('wallet')}
            >
              <div style={{ fontSize: 22 }}>👛</div>
              <div>
                <p className={styles.paymentOptionTitle}>SpiceGarden Wallet</p>
                <p className={styles.paymentOptionSub}>Bal: ₹500 available</p>
              </div>
            </div>
            <div
              className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentOptionActive : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <div style={{ fontSize: 22 }}>💵</div>
              <div>
                <p className={styles.paymentOptionTitle}>Cash on Delivery</p>
                <p className={styles.paymentOptionSub}>Pay at doorstep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Partner Tip */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              🛵 Delivery Tip for Partner
            </h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>100% goes to driver</span>
          </div>
          <div className={styles.tipOptions}>
            {[0, 30, 50, 100].map((amount) => (
              <button
                key={amount}
                type="button"
                className={`${styles.tipBtn} ${tip === amount ? styles.tipBtnActive : ''}`}
                onClick={() => setTip(amount)}
              >
                {amount === 0 ? 'No tip' : `₹${amount}`}
              </button>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>
            <ShieldCheck size={18} color="#16a34a" /> Bill Details
          </h2>
          <div className={styles.billRow}>
            <span>Item Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className={styles.billRow}>
            <span>Delivery Partner Fee</span>
            <span>{deliveryFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${deliveryFee}`}</span>
          </div>
          <div className={styles.billRow}>
            <span>Taxes &amp; Restaurant Packaging</span>
            <span>₹{taxes}</span>
          </div>
          {tip > 0 && (
            <div className={styles.billRow}>
              <span>Delivery Tip</span>
              <span>₹{tip}</span>
            </div>
          )}
          {discount > 0 && (
            <div className={styles.billRow} style={{ color: '#16a34a', fontWeight: 600 }}>
              <span>Coupon Discount ({appliedPromo})</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className={styles.billRowTotal}>
            <span>To Pay</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className={styles.bottomSticky}>
        <div className={styles.bottomStickyInner}>
          <div>
            <p className={styles.stickyTotalLabel}>Total to Pay</p>
            <p className={styles.stickyTotalVal}>₹{grandTotal}</p>
          </div>
          <button
            type="button"
            className={styles.placeOrderBtn}
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <span>Place Order</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}