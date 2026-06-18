import React, { useReducer } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../components/ProtectedRoute';
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
  placed: '#2196f3',
  preparing: '#ff9800',
  ready: '#ff9800',
  pickedup: '#ff9800',
  delivered: '#4caf50',
  cancelled: '#f44336',
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
  restaurant?: {
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

interface OrderDetailsPageProps {
  orderId: string;
}

const fetchOrder = async (orderId: string, token: string | null): Promise<Order> => {
  const data = await ordersApi.get(orderId, token || '').then(res => res.data);
  return data as Order;
};

const OrderDetailsPage = ({ orderId }: OrderDetailsPageProps) => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: order, isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['order', orderId, user?.token],
    queryFn: () => fetchOrder(orderId, user?.token || null),
  });

  const error = fetchError instanceof Error ? 'Failed to load order details. Please try again later.' : null;

  if (loading && !order) {
    return (
      <div className={styles.loadingState}>
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
        <p>Order not found</p>
        <Button label="Back to Orders" onClick={() => router.push('/history')} variant="secondary" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Button label="← Back" onClick={() => router.push('/history')} variant="secondary" className={styles.backButton} />

        <h2 className={styles.pageTitle}>Order #{order.id}</h2>

      {order.restaurant && (
        <Card title="Restaurant">
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

<Card title="Order Items">
          <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx: number) => (
                <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: DESIGN_TOKENS.spacing.sm, borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, alignItems: 'center' }}>
                    {item.image ? (
                       <Image
                         src={item.image}
                         alt={item.name || 'Order item'}
                         width={40}
                         height={40}
                         style={{ borderRadius: DESIGN_TOKENS.radius.sm, objectFit: 'cover' }}
                       />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: DESIGN_TOKENS.radius.sm, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍔</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Quantity: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{(item.price || 0) * (item.quantity || 1)}</div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: DESIGN_TOKENS.spacing.lg }}>No items in this order</p>
            )}
          </div>
        </Card>

      <Card title="Order Summary">
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.xs }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Item Total</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxes</span>
            <span>₹{order.tax}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tip</span>
            <span>₹{order.tip}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: DESIGN_TOKENS.spacing.sm }}>
            <span>Total</span>
            <span>₹{order.grandTotal}</span>
          </div>
        </div>
      </Card>

<Card title="Order Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status</span>
               <span className={styles.statusBadge} style={{ backgroundColor: `${STATUS_COLORS[order.status || 'delivered']}20`, color: STATUS_COLORS[order.status || 'delivered'] }}>{STATUS_LABELS[order.status || ''] || order.status || 'Unknown'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Order Date</span>
              <span>{new Date(order.createdAt || '').toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Updated</span>
              <span>{new Date(order.updatedAt || '').toLocaleString()}</span>
            </div>
          </div>
        </Card>

      <Card title="Delivery Address">
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
          {order.deliveryAddress && (
            <>
              <div style={{ fontWeight: 'bold', marginBottom: DESIGN_TOKENS.spacing.xs }}>Delivery Address</div>
              <div style={{ color: '#666' }}>{order.deliveryAddress.street}</div>
              <div style={{ color: '#666' }}>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</div>
            </>
          )}
        </div>
      </Card>

      <Card title="Payment Information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Payment Method</span>
            <span>{order.paymentMethod?.toUpperCase() || 'Not specified'}</span>
          </div>
        </div>
      </Card>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div style={{ marginTop: DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
          <Button label="Contact Restaurant" onClick={() => {}} variant="secondary" style={{ marginRight: DESIGN_TOKENS.spacing.md }} />
          <Button label="Reorder" onClick={() => {}} />
        </div>
      )}

        {order.status === 'delivered' && (
          <div style={{ marginTop: DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
            <Button label="Reorder" onClick={() => {}} variant="secondary" style={{ marginRight: DESIGN_TOKENS.spacing.md }} />
            <Button label="Leave Review" onClick={() => {}} />
          </div>
        )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><OrderDetailsPage {...props} /></ProtectedRoute>;
}