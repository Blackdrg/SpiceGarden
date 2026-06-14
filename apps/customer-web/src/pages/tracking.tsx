import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Card } from '@spicegarden/ui';
import { useTracking } from '../hooks/useTracking';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './tracking.module.css';

interface TrackingItem {
  id?: string | number;
  name?: string;
  quantity?: number;
  price?: number;
}

interface TrackingOrder {
  id?: string;
  status?: string;
  items?: TrackingItem[];
  total?: number;
}

const TrackingPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { location } = useTracking('driver-123');
  const [orderDetails, setOrderDetails] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const orderIdRef = useRef<string | null>(null);
  const orderStatusRef = useRef('preparing');
  const estimatedTimeRef = useRef(15);
  const [displayOrderStatus, setDisplayOrderStatus] = useState('preparing');
  const [displayEstimatedTime, setDisplayEstimatedTime] = useState(15);

  useEffect(() => {
    const queryOrderId = router.query.order as string | undefined;
    if (queryOrderId) {
      orderIdRef.current = queryOrderId;
    } else {
      const storedOrderId = localStorage.getItem('lastOrderId');
      if (storedOrderId) orderIdRef.current = storedOrderId;
    }
  }, [router.query]);

  useEffect(() => {
    const orderId = orderIdRef.current;
    if (!orderId || !user?.token) return;

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const response = await ordersApi.get(orderId, user.token);
        if (cancelled) return;
        const order = response.data as TrackingOrder;
        setOrderDetails(order);
        orderStatusRef.current = order.status || 'preparing';
        setDisplayOrderStatus(order.status || 'preparing');
        switch (order.status) {
          case 'preparing': estimatedTimeRef.current = 10 + Math.floor(Math.random() * 10); break;
          case 'ready': estimatedTimeRef.current = 5 + Math.floor(Math.random() * 5); break;
          case 'pickedup': estimatedTimeRef.current = 8 + Math.floor(Math.random() * 12); break;
          case 'delivered': estimatedTimeRef.current = 0; break;
          default: estimatedTimeRef.current = 15;
        }
        setDisplayEstimatedTime(estimatedTimeRef.current);
      } catch {
        if (!cancelled) {
          setOrderDetails({ id: orderId, status: 'preparing', items: [], total: 0 });
          orderStatusRef.current = 'preparing';
          setDisplayOrderStatus('preparing');
          estimatedTimeRef.current = 15;
          setDisplayEstimatedTime(15);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [user?.token]);

  const handleCallDriver = useCallback(() => {}, []);
  const handleContactSupport = useCallback(() => {}, []);

  const statusSteps = [
    { id: 'placed', label: 'Order Placed', done: true },
    { id: 'preparing', label: 'Preparing', done: ['preparing', 'ready', 'pickedup', 'delivered'].includes(displayOrderStatus) },
    { id: 'ready', label: 'Ready for Pickup', done: ['ready', 'pickedup', 'delivered'].includes(displayOrderStatus) },
    { id: 'pickedup', label: 'Picked Up', done: ['pickedup', 'delivered'].includes(displayOrderStatus) },
    { id: 'delivered', label: 'Delivered', done: displayOrderStatus === 'delivered' },
  ];

  if (loading && !orderDetails) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Track Order #{orderDetails?.id?.toUpperCase() || 'SG12345'}</h2>

      <div className={styles.statusContainer}>
        {statusSteps.map((step, idx) => (
          <div key={step.id} className={styles.statusStep}>
            <div className={step.done ? styles.iconDone : styles.iconPending}>
              {step.done ? '✓' : idx + 1}
            </div>
            <span className={styles.stepLabel}>{step.label}</span>
          </div>
        ))}
      </div>

      {location && (
        <Card title="Live Tracking">
          <div className={styles.driverInfo}>
            <div className={styles.vehicleIcon}>🛵</div>
            <p className={styles.driverName}>Driver: Raj Kumar</p>
            <p className={styles.eta}>ETA: {displayEstimatedTime} mins</p>
          </div>
          <div className={styles.locationInfo}>
            <span>Current Location</span>
            <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
          <div className={styles.buttonGroup}>
            <Button label="Call Driver" onClick={() => {/* TODO: Implement dialer */}} className={styles.fullWidthButton} />
            <Button label="Contact Support" onClick={() => {/* TODO: Implement support contact */}} variant="secondary" className={styles.secondaryButton} />
          </div>
        </Card>
      )}

{orderDetails && (
        <Card title="Order Details">
          <div className={styles.detailsContent}>
            {orderDetails.items && orderDetails.items.length > 0 ? (
              orderDetails.items.map((item, idx: number) => (
                <div key={item.id || idx} className={styles.itemRow}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>&#8377;{(item.price || 0) * (item.quantity || 1)}</span>
                </div>
              ))
            ) : (
              <p>No item details available</p>
            )}
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span>&#8377;{orderDetails.total || 0}</span>
            </div>
          </div>
        </Card>
      )}

      {orderStatus !== 'delivered' && (
        <div className={styles.contactRestaurantDiv}>
          <Button label="Contact Restaurant" onClick={() => {/* TODO: Implement restaurant contact */}} variant="secondary" />
        </div>
      )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><TrackingPage {...props} /></ProtectedRoute>;
}