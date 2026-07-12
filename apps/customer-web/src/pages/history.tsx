import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS, SkeletonCard, HomeIcon, SearchIcon, CartIcon, ProfileIcon } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@spicegarden/ui';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
import { addToCart, clearCart, CartItem } from '../redux/slices/cartSlice';
import { StarIcon, RefreshCcwIcon } from 'lucide-react';
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
  const toast = useToast();
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
        toast.showToast({ message: 'Items added to cart! You can now proceed to checkout.', type: 'success', duration: 4000 });
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
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Order History</h2>
        <p className={styles.pageSubtitle}>View and reorder your past orders</p>
      </div>

      {error && (
        <div className={styles.errorBox}>{error}</div>
      )}

      <div className={styles.filterBar}>
        {[
          { key: 'all', label: 'All' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'preparing', label: 'Preparing' },
          { key: 'ready', label: 'Ready' },
          { key: 'pickedup', label: 'Picked Up' },
        ].map(f => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f.key as any)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <SkeletonCard count={3} />
          <p className={styles.loadingText}>Loading orders…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.noOrders}>
          <div className={styles.noOrdersIcon}>
            <RefreshCcwIcon size={32} color={DESIGN_TOKENS.colors.textTertiary} />
          </div>
          <h3 className={styles.noOrdersTitle}>No orders yet</h3>
          <p className={styles.noOrdersMsg}>Your order history will appear here once you place your first order.</p>
          <Button label="Place First Order" onClick={() => router.push('/search')} variant="secondary" />
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map(order => (
            <Card key={order.id} title={`#${order.id}`} variant="interactive" onClick={() => router.push(`/order-details?id=${order.id}`)}>
              <div className={styles.orderHeader}>
                <div>
                  <h4 className={styles.orderRestaurant}>{order.restaurant}</h4>
                  <p className={styles.orderDetails}>{order.items} items · ₹{order.amount} · {order.date}</p>
                </div>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                  {order.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <div className={styles.ratingContainer}>
                {(order.rating || 0) > 0 && (
                  <div className={styles.ratingFlex}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarIcon key={star} size={14} fill={star <= (order.rating || 0) ? DESIGN_TOKENS.colors.warning : 'none'} color={star <= (order.rating || 0) ? DESIGN_TOKENS.colors.warning : DESIGN_TOKENS.colors.gray200} />
                    ))}
                  </div>
                )}
                <Button label="Reorder" onClick={() => { handleReorder(order.id); }} variant="secondary" size="sm" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIcon, path: '/search' },
          { key: 'orders', label: 'Orders', icon: CartIcon, path: '/history' },
          { key: 'account', label: 'Account', icon: ProfileIcon, path: '/profile' },
        ].map(tab => (
          <button
            type="button"
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            className={`${styles.navButton} ${getNavColorClass(tab.key)}`}
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

export default HistoryPage;
