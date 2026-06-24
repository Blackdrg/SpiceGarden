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
        <div className={styles.itemsList}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx: number) => (
              <div key={item.id || idx} className={styles.itemRow}>
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

      <Card title="Order Summary">
        <div className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <span>Item Total</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery Fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Taxes</span>
            <span>₹{order.tax}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tip</span>
            <span>₹{order.tip}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span>₹{order.grandTotal}</span>
          </div>
        </div>
      </Card>

      <Card title="Order Information">
        <div className={styles.infoList}>
          <div className={styles.summaryRow}>
            <span>Status</span>
             <span className={`${styles.statusBadge} ${styles[order.status || 'delivered']}`}>{STATUS_LABELS[order.status || ''] || order.status || 'Unknown'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Order Date</span>
            <span>{new Date(order.createdAt || '').toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Last Updated</span>
            <span>{new Date(order.updatedAt || '').toLocaleString()}</span>
          </div>
        </div>
      </Card>

      <Card title="Delivery Address">
        <div className={styles.infoList}>
          {order.deliveryAddress && (
            <>
              <div className={styles.addressLabel}>Delivery Address</div>
              <div className={styles.addressText}>{order.deliveryAddress.street}</div>
              <div className={styles.addressText}>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</div>
            </>
          )}
        </div>
      </Card>

      <Card title="Payment Information">
        <div className={styles.infoList}>
          <div className={styles.summaryRow}>
            <span>Payment Method</span>
            <span>{order.paymentMethod?.toUpperCase() || 'Not specified'}</span>
          </div>
        </div>
      </Card>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className={styles.actionWrapper}>
          <Button label="Contact Restaurant" onClick={() => {}} variant="secondary" className={styles.mr16} />
          <Button label="Reorder" onClick={() => {}} />
        </div>
      )}

      {order.status === 'delivered' && (
        <div className={styles.actionWrapper}>
          <Button label="Reorder" onClick={() => {}} variant="secondary" className={styles.mr16} />
          <Button label="Leave Review" onClick={() => {}} />
        </div>
      )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><OrderDetailsPage {...props} /></ProtectedRoute>;
}