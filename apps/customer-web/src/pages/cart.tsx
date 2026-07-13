import { Button, Card, DESIGN_TOKENS, HomeIcon, SearchIcon, CartIcon, ProfileIcon } from '@spicegarden/ui';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
import { useRouter } from 'next/router';
import { Trash2Icon, ShoppingCartIcon } from 'lucide-react';
import styles from './cart.module.css';

const CartPage = () => {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20;
  const taxes = total * 0.05;
  const grandTotal = total + deliveryFee + taxes;

  const handleCheckout = () => {
    const items = JSON.stringify(cartItems);
    router.push({ pathname: '/checkout', query: { items, total: grandTotal, deliveryFee, taxes } });
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Cart</h2>
        </div>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>
            <ShoppingCartIcon size={40} color={DESIGN_TOKENS.colors.textTertiary} />
          </div>
          <h3 className={styles.emptyTitle}>Your cart is empty</h3>
          <p className={styles.emptySubtitle}>Add items from restaurants to get started</p>
          <Button label="Browse Restaurants" onClick={() => router.push('/')} variant="secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Your Cart</h2>
        <p className={styles.pageSubtitle}>{cartItems.length} items in your cart</p>
      </div>

      <div className={styles.itemsList}>
        {cartItems.map((item) => (
          <div key={item.id} className={styles.itemCard}>
            <div className={styles.itemRow}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemDesc}>₹{item.price} each</div>
                <div className={styles.qtyControls}>
                  <Button
                    label="−"
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                    variant="secondary"
                    size="sm"
                    className={styles.qtyBtn}
                  />
                  <span className={styles.qtyText}>{item.quantity}</span>
                  <Button
                    label="+"
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                    variant="secondary"
                    size="sm"
                    className={styles.qtyBtn}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={styles.priceText}>₹{item.price * item.quantity}</span>
                <button
                  type="button"
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className={styles.deleteButton}
                  aria-label="Remove item"
                >
                  <Trash2Icon size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.billSection}>
        <Card title="Bill Details" variant="elevated">
          <div className={styles.billRow}>
            <span>Item Total</span>
            <span style={{ fontWeight: 600 }}>₹{total}</span>
          </div>
          <div className={styles.billRow}>
            <span>Delivery Fee</span>
            <span style={{ fontWeight: 600 }}>₹{deliveryFee}</span>
          </div>
          <div className={styles.billRow}>
            <span>Taxes (5%)</span>
            <span style={{ fontWeight: 600 }}>₹{taxes.toFixed(0)}</span>
          </div>
          <div className={styles.billRowTotal}>
            <span>Grand Total</span>
            <span style={{ color: DESIGN_TOKENS.colors.primary, fontSize: '1.125rem' }}>₹{grandTotal.toFixed(0)}</span>
          </div>
        </Card>
      </div>

      <div className={styles.footer}>
        <Button label="Proceed to Checkout" onClick={handleCheckout} fullWidth />
      </div>

      {/* Bottom nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIcon, path: '/search' },
          { key: 'cart', label: 'Cart', icon: CartIcon, path: '/cart' },
          { key: 'account', label: 'Account', icon: ProfileIcon, path: '/profile' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            className={`${styles.navButton} ${tab.key === 'cart' ? styles.navActive : styles.navInactive}`}
            aria-label={tab.label}
          >
            <span className={styles.navIcon}><tab.icon size={22} /></span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CartPage;
