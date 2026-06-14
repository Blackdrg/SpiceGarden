import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
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

const OrderDetailsPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const loadOrderDetails = async () => {
      const orderId = router.query.id as string | undefined;
      if (!orderId) {
        router.push('/history');
        return;
      }

      if (!user?.token || user?.token === 'demo-token') {
        timerId = setTimeout(() => {
          setOrder({
            id: orderId,
            restaurant: {
              name: 'Burger King',
              image: 'https://example.com/restaurant.jpg',
            },
            items: [
              { id: 1, name: 'Whopper', quantity: 2, price: 149, image: 'https://example.com/whopper.jpg' },
              { id: 2, name: 'Large Coke', quantity: 1, price: 79, image: 'https://example.com/coke.jpg' },
            ],
            status: 'delivered',
            createdAt: '2026-05-20T19:30:00Z',
            updatedAt: '2026-05-20T20:00:00Z',
            subtotal: 377,
            deliveryFee: 20,
            tax: 19,
            tip: 50,
            grandTotal: 466,
            deliveryAddress: {
              street: 'Home - Sector 17',
              city: 'Chandigarh',
              state: 'Chandigarh',
              pincode: '160017',
            },
            paymentMethod: 'card',
          });
        }, 600);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await ordersApi.get(orderId, user.token);
        setOrder(data.data as Order);
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
    return () => { if (timerId) clearTimeout(timerId); };
  }, [router, router.query.id, user?.token]);

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
                 <div style={{ textAlign: 'right', fontWeight: 'bold' }}>&#8377;{(item.price || 0) * (item.quantity || 1)}</div>
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
            <span>&#8377;{order.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Fee</span>
            <span>&#8377;{order.deliveryFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxes</span>
            <span>&#8377;{order.tax}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tip</span>
            <span>&#8377;{order.tip}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: DESIGN_TOKENS.spacing.sm }}>
            <span>Total</span>
            <span>&#8377;{order.grandTotal}</span>
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
          <Button label="Contact Restaurant" onClick={() => {/* TODO: Implement restaurant contact */}} variant="secondary" style={{ marginRight: DESIGN_TOKENS.spacing.md }} />
          <Button label="Reorder" onClick={() => {/* TODO: Implement reorder functionality */}} />
        </div>
      )}

        {order.status === 'delivered' && (
          <div style={{ marginTop: DESIGN_TOKENS.spacing.lg, textAlign: 'center' }}>
            <Button label="Reorder" onClick={() => {/* TODO: Implement reorder functionality */}} variant="secondary" style={{ marginRight: DESIGN_TOKENS.spacing.md }} />
            <Button label="Leave Review" onClick={() => {/* TODO: Implement leave review functionality */}} />
          </div>
        )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><OrderDetailsPage {...props} /></ProtectedRoute>;
}