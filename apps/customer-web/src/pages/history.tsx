import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS, SkeletonCard } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
import { addToCart, clearCart, CartItem } from '../redux/slices/cartSlice';
import styles from './history.module.css';

interface ApiOrder {
  id?: string;
  date?: string;
  time?: string;
  restaurant?: string;
  items?: number;
  amount?: number;
  status?: string;
  rating?: number;
  createdAt?: string;
}

interface Order {
  id: string;
  date: string;
  time: string;
  restaurant: string;
  items: number;
  amount: number;
  status?: string;
  rating?: number;
}

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case 'delivered':
      return styles.statusDelivered;
    case 'cancelled':
      return styles.statusCancelled;
    case 'preparing':
    case 'ready':
    case 'pickedup':
      return styles.statusActive;
    default:
      return styles.statusBadgeDefault;
  }
}

function getNavColorClass(key: string) {
  return key === 'orders' ? styles.navActive : styles.navInactive;
}

const HistoryPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'delivered' | 'cancelled' | 'preparing' | 'ready' | 'pickedup'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    const loadOrderHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersApi.list();
        const data = response.data;
        const transformedOrders: Order[] = (data as ApiOrder[]).map(order => ({
          id: order.id || '',
          date: order.date || new Date(order.createdAt || '').toISOString().split('T')[0],
          time: order.time || new Date(order.createdAt || '').toISOString().split('T')[1]?.substring(0, 5) || '',
          restaurant: order.restaurant || 'Unknown Restaurant',
          items: order.items || 0,
          amount: order.amount || 0,
          status: order.status,
          rating: order.rating || 0,
        }));
        setOrders(transformedOrders);
      } catch (err) {
        console.error('Failed to load order history:', err);
        setError('Failed to load order history. Please try again later.');
        timerId = setTimeout(() => {
          setOrders([
            { id: 'SG12345', date: '2026-05-20', time: '19:30', restaurant: 'Burger King', items: 2, amount: 347, status: 'delivered', rating: 5 },
            { id: 'SG12344', date: '2026-05-18', time: '12:15', restaurant: 'Pizza Hut', items: 1, amount: 299, status: 'delivered', rating: 4 },
            { id: 'SG12343', date: '2026-05-15', time: '20:45', restaurant: 'Subway', items: 3, amount: 420, status: 'delivered', rating: 5 },
            { id: 'SG12342', date: '2026-05-10', time: '14:20', restaurant: "Domino's", items: 2, amount: 380, status: 'cancelled', rating: 0 },
          ]);
        }, 600);
      } finally {
        setLoading(false);
      }
    };
    loadOrderHistory();
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleReorder = async (orderId: string) => {
    try {
      const response = await ordersApi.get(orderId);
      const order = response.data as { id?: string; items?: { menuItemId?: string; id?: string; name?: string; price?: number; quantity?: number }[]; restaurantId?: string };
      const cartItems: CartItem[] = order.items?.map(item => ({
        id: item.menuItemId || item.id || '',
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
      })) || [];

      if (cartItems.length > 0) {
        dispatch(clearCart());
        cartItems.forEach(item => {
          dispatch(addToCart({ item, restaurantId: order.restaurantId || 'rest-001' }));
        });
        alert('Items added to cart! You can now proceed to checkout.');
        router.push('/cart');
      } else {
        throw new Error('No items found in order');
      }
    } catch (err) {
      console.error('Failed to reorder:', err);
      setError('Failed to reorder. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Order History</h2>

      {error && (
        <div className={styles.errorBox}>{error}</div>
      )}

      <div className={styles.filterBar}>
        {[{ key: 'all', label: 'All' }, { key: 'delivered', label: 'Delivered' }, { key: 'cancelled', label: 'Cancelled' }, { key: 'preparing', label: 'Preparing' }, { key: 'ready', label: 'Ready' }, { key: 'pickedup', label: 'Picked Up' }].map(f => (
          <Button
            key={f.key}
            label={f.label}
            onClick={() => setFilter(f.key as any)}
            variant={filter === f.key ? 'primary' : 'secondary'}
          />
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <SkeletonCard count={3} />
          <p className={styles.loadingText}>Loading orders…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.noOrders}>
          <div className={styles.noOrdersIcon}>📦</div>
          <h3 className={styles.noOrdersTitle}>No orders yet</h3>
          <p className={styles.noOrdersMsg}>Your order history will appear here once you place your first order.</p>
          <Button label="Place First Order" onClick={() => router.push('/search')} variant="secondary" />
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map(order => (
            <Card key={order.id} title={`#${order.id}`}>
              <div className={styles.orderHeader}>
                <div>
                  <h4 className={styles.orderRestaurant}>{order.restaurant}</h4>
                  <p className={styles.orderDetails}>{order.items} items · ₹{order.amount}</p>
                </div>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                  {order.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <p className={styles.orderDateTime}>{order.date} · {order.time}</p>
              <div className={styles.ratingContainer}>
                {(order.rating || 0) > 0 && (
                  <div className={styles.ratingFlex}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= (order.rating || 0) ? styles.ratingStarActive : styles.ratingStarInactive}>★</span>
                    ))}
                  </div>
                )}
                <Button label="Reorder" onClick={() => handleReorder(order.id)} variant="secondary" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom nav */}
      <nav className={styles.bottomNav}>
        {[{ key: 'home', label: 'Home', icon: '🏠', path: '/' }, { key: 'search', label: 'Search', icon: '�??', path: '/search' }, { key: 'orders', label: 'Orders', icon: '📦' }, { key: 'account', label: 'Account', icon: '👤', path: '/profile' }].map(tab => (
          <button
            type="button"
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.path && router.push(tab.path); } }}
            className={`${styles.navButton} ${getNavColorClass(tab.key)}`}
          >
            <span className={styles.navIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default HistoryPage;
