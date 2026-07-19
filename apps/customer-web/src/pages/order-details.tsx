import React, { useReducer } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { addToCart } from '../redux/slices/cartSlice';
import { ordersApi } from '@spicegarden/shared/api';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../components/ProtectedRoute';
import { ArrowLeftIcon, StarIcon, MapPinIcon, CreditCardIcon, RefreshCwIcon } from 'lucide-react';
import styles from './order-details.module.css';

const STATUS_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  pickedup: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  placed: DESIGN_TOKENS.colors.info,
  preparing: DESIGN_TOKENS.colors.warning,
  ready: DESIGN_TOKENS.colors.warning,
  pickedup: DESIGN_TOKENS.colors.info,
  delivered: DESIGN_TOKENS.colors.success,
  cancelled: DESIGN_TOKENS.colors.danger,
};

interface OrderItem {
  id?: string | number;
  name?: string;
  quantity?: number;
  price?: number;
  image?: string;
}

interface Order {
  id?: string;
  restaurantId?: string;
  restaurant?: {
    id?: string;
    name?: string;
    image?: string;
  };
  items?: OrderItem[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  tip?: number;
  grandTotal?: number;
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  paymentMethod?: string;
}

export const getServerSideProps = async (context: { query: { id?: string }; resolvedUrl: string }) => {
  const orderId = context.query.id as string | undefined;

  if (!orderId) {
    return {
      redirect: {
        destination: '/history',
        permanent: false,
      },
    };
  }

  return { props: { orderId } };
};

const fetchOrder = async (orderId: string): Promise<Order> => {
  const data = await ordersApi.get(orderId).then(res => res.data);
  return data as Order;
};

const OrderDetailsPage = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: order, isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const error = fetchError instanceof Error ? 'Failed to load order details. Please try again later.' : null;

  const handleTrackOrder = () => {
    router.push(`/tracking?order=${orderId}`);
  };

  const handleReorder = () => {
    const items: Array<{ item: { id: string; name: string; price: number; quantity: number }; restaurantId: string }> = [];
    for (const item of order?.items || []) {
      if (!item || !item.id) continue;
      items.push({
        item: {
          id: String(item.id),
          name: String(item.name || ''),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        },
        restaurantId: order?.restaurant?.id || order?.restaurantId || '',
      });
    }
    items.forEach((entry) => dispatch(addToCart(entry)));
    router.push('/cart');
  };


  if (loading && !order) {
    return (
      <div className={styles.loadingState}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--color-border, #E5E7EB)', borderTopColor: 'var(--color-primary, #FF5A1F)', borderRadius: '50%', animation: 'sg-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorBanner}>
          {error}
        </div>
        <Button label="Back to Orders" onClick={() => router.push('/history')} variant="secondary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.notFoundState}>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Order not found</p>
        <Button label="Back to Orders" onClick={() => router.push('/history')} variant="secondary" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <Button onClick={() => router.push('/history')} variant="secondary">
          <ArrowLeftIcon size={18} />
        </Button>
      </div>

      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Order #{order.id}</h2>
        <p className={styles.pageSubtitle}>Order details and tracking</p>
      </div>

      {order.restaurant && (
        <Card title="Restaurant" variant="elevated">
          <div className={styles.restaurantContent}>
            {order.restaurant.image ? (
              <Image
                src={order.restaurant.image}
                alt={order.restaurant.name || 'Restaurant'}
                width={60}
                height={60}
                className={styles.restaurantImage}
              />
            ) : (
              <div className={styles.restaurantPlaceholder}>🍽️</div>
            )}
            <div>
              <h3 className={styles.restaurantTitle}>{order.restaurant.name}</h3>
              <p className={styles.restaurantSubtitle}>Restaurant Partner</p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Order Items" variant="elevated">
        <div className={styles.itemsList}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.itemImageWrap}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name || 'Order item'}
                      width={40}
                      height={40}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.itemPlaceholder}>🍔</div>
                  )}
                  <div>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemMeta}>Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div className={styles.itemPrice}>₹{(item.price || 0) * (item.quantity || 1)}</div>
              </div>
            ))
          ) : (
            <p className={styles.emptyItems}>No items in this order</p>
          )}
        </div>
      </Card>

      <Card title="Order Summary" variant="elevated">
        <div className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <span>Item Total</span>
            <span style={{ fontWeight: 600 }}>₹{order.subtotal}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery Fee</span>
            <span style={{ fontWeight: 600 }}>₹{order.deliveryFee}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Taxes</span>
            <span style={{ fontWeight: 600 }}>₹{order.tax}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tip</span>
            <span style={{ fontWeight: 600 }}>₹{order.tip}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span style={{ color: DESIGN_TOKENS.colors.primary, fontWeight: 700 }}>₹{order.grandTotal}</span>
          </div>
        </div>
      </Card>

      <Card title="Order Information" variant="elevated">
        <div className={styles.infoList}>
          <div className={styles.summaryRow}>
            <span>Status</span>
            <span className={`${styles.statusBadge} ${styles[order.status || 'delivered']}`}>{STATUS_LABELS[order.status || ''] || order.status || 'Unknown'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Order Date</span>
            <span><FormattedDateTime value={order.createdAt} /></span>
          </div>
          <div className={styles.summaryRow}>
            <span>Last Updated</span>
            <span><FormattedDateTime value={order.updatedAt} /></span>
          </div>
        </div>
      </Card>

      {order.deliveryAddress && (
        <Card title="Delivery Address" variant="elevated">
          <div className={styles.infoList}>
            <div className={styles.addressLabel}>Delivery Address</div>
            <div className={styles.addressText}>{order.deliveryAddress.street}</div>
            <div className={styles.addressText}>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</div>
          </div>
        </Card>
      )}

      <Card title="Payment Information" variant="elevated">
        <div className={styles.infoList}>
          <div className={styles.summaryRow}>
            <span>Payment Method</span>
            <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{order.paymentMethod?.toUpperCase() || 'Not specified'}</span>
          </div>
        </div>
      </Card>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className={styles.actionWrapper}>
          <Button onClick={handleTrackOrder} variant="secondary" className={styles.mr16} aria-label="Track order">
            <MapPinIcon size={16} />
          </Button>
          <Button onClick={handleReorder} aria-label="Reorder">
            <RefreshCwIcon size={16} />
          </Button>
        </div>
      )}

      {order.status === 'delivered' && (
        <div className={styles.actionWrapper}>
          <Button onClick={handleReorder} variant="secondary" className={styles.mr16} aria-label="Reorder">
            <RefreshCwIcon size={16} />
          </Button>
          <Button onClick={() => router.push('/history')} aria-label="Rate order">
            <StarIcon size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

const FormattedDateTime = ({ value }: { value?: string }) => {
  if (!value) return null;
  return <>{new Date(value).toLocaleString()}</>;
};

const RefreshIcon = ({ size, color }: { size?: number; color?: string }) => (
  <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

export default function Wrapped(props: any) {
  return <ProtectedRoute><OrderDetailsPage {...props} /></ProtectedRoute>;
}
