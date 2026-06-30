import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
import { useRouter } from 'next/router';
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
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>&#x1F6D2;</div>
        <h2>Your cart is empty</h2>
        <p className={styles.emptySubtitle}>Add items from restaurants</p>
        <Button label="Browse Restaurants" onClick={() => router.push('/')} variant="secondary" />
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h2 className={styles.cartTitle}>Your Cart</h2>

       <div className={styles.itemsList}>
         {cartItems.map((item) => (
           <Card key={item.id} title={item.name}>
             <div className={styles.itemRow}>
                <div>
                  <div className={styles.qtyControls}>
                    <Button label="-" onClick={() => {
                      dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                    }} variant="secondary" className={styles.btnIcon} />
                    <span className={styles.qtyText}>{item.quantity}</span>
                    <Button label="+" onClick={() => {
                      dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
                    }} variant="secondary" className={styles.btnIcon} />
                  </div>
                  <span className={styles.priceText}>
                    &#8377;{item.price * item.quantity}
                  </span>
                </div>
               <Button label="Remove" onClick={() => dispatch(removeFromCart(item.id))} variant="secondary" />
             </div>
           </Card>
         ))}
       </div>

      <Card title="Bill Details">
        <div className={styles.billRowXs}>
          <span>Item Total</span>
          <span>&#8377;{total}</span>
        </div>
        <div className={styles.billRowXs}>
          <span>Delivery Fee</span>
          <span>&#8377;{deliveryFee}</span>
        </div>
        <div className={styles.billRowMd}>
          <span>Taxes</span>
          <span>&#8377;{taxes.toFixed(0)}</span>
        </div>
        <div className={styles.billRowTotal}>
          <span>Grand Total</span>
          <span>&#8377;{grandTotal.toFixed(0)}</span>
        </div>
      </Card>

      <div className={styles.footer}>
        <Button label="Proceed to Checkout" onClick={handleCheckout} />
      </div>
    </div>
  );
};

export default CartPage;
