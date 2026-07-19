import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useTracking } from '../hooks/useTracking';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
import { API_URL } from '@spicegarden/shared/constants';
import ProtectedRoute from '../components/ProtectedRoute';
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon } from 'lucide-react';
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
  driverId?: string;
  driverPhone?: string;
  restaurantId?: string;
  branchAddress?: string;
}

const TrackingPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orderDetails, setOrderDetails] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const orderIdRef = useRef<string | null>(null);
  const [displayOrderStatus, setDisplayOrderStatus] = useState('preparing');
  const [displayEstimatedTime, setDisplayEstimatedTime] = useState(15);

  const { location } = useTracking(orderDetails?.driverId || null);

  useEffect(() => {
    const queryOrderId = router.query.order as string | undefined;
    if (queryOrderId) {
      orderIdRef.current = queryOrderId;
    } else {
      const storedOrderId = sessionStorage.getItem('lastOrderId');
      if (storedOrderId) orderIdRef.current = storedOrderId;
    }
  }, [router.query]);

  useEffect(() => {
    const orderId = orderIdRef.current;
    if (!orderId) return;

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      const currentOrderId = orderIdRef.current;
      if (!currentOrderId) return;

      setLoading(true);
      try {
        const response = await ordersApi.get(currentOrderId!);
        if (cancelled) return;
        const order = response.data as TrackingOrder;
        setOrderDetails(order);
        setDisplayOrderStatus(order.status || 'preparing');
        switch (order.status) {
          case 'preparing': setDisplayEstimatedTime(10 + Math.floor(Math.random() * 10)); break;
          case 'ready': setDisplayEstimatedTime(5 + Math.floor(Math.random() * 5)); break;
          case 'pickedup': setDisplayEstimatedTime(8 + Math.floor(Math.random() * 12)); break;
          case 'delivered': setDisplayEstimatedTime(0); break;
          default: setDisplayEstimatedTime(15);
        }
      } catch {
        if (!cancelled) {
          setOrderDetails({ id: orderId, status: 'preparing', items: [], total: 0 });
          setDisplayOrderStatus('preparing');
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
  }, []);

  const handleCallDriver = useCallback(() => {
    if (orderDetails?.driverPhone) {
      window.location.href = `tel:${orderDetails.driverPhone}`;
    }
  }, [orderDetails]);

  const handleContactSupport = useCallback(() => {
    window.location.href = 'mailto:support@spicegarden.com';
  }, []);

  const handleContactRestaurant = useCallback(() => {
    if (orderDetails?.restaurantId) {
      router.push(`/restaurant?id=${orderDetails.restaurantId}`);
    }
  }, [orderDetails, router]);

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
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Track Order #{orderDetails?.id?.toUpperCase() || 'SG12345'}</h2>
        <p className={styles.pageSubtitle}>Real-time updates on your order</p>
      </div>

      <div className={styles.statusTimeline}>
        {statusSteps.map((step, idx) => (
          <div key={step.id} className={styles.statusStep}>
            <div className={`${styles.statusIcon} ${step.done ? styles.statusIconDone : styles.statusIconPending}`}>
              {step.done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
            <span className={`${styles.stepLabel} ${step.done ? styles.stepLabelDone : ''}`}>{step.label}</span>
          </div>
        ))}
      </div>

      {location && orderDetails?.driverId && (
        <Card title="Live Tracking" variant="elevated">
          <div className={styles.driverSection}>
            <div className={styles.driverIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DESIGN_TOKENS.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3 className={styles.driverName}>Your delivery partner is on the way</h3>
            <p className={styles.driverEta}>
              <ClockIcon size={16} style={{ display: 'inline', marginRight: 4 }} />
              ETA: {displayEstimatedTime} mins
            </p>
          </div>
          <div className={styles.locationRow}>
            <span>Current Location</span>
            <span style={{ fontFamily: DESIGN_TOKENS.typography.fontFamilyMono, fontSize: '0.8125rem' }}>
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Button onClick={handleCallDriver} disabled={!orderDetails?.driverPhone}><PhoneIcon size={16} /></Button>
            <Button onClick={handleContactSupport} variant="secondary"><MailIcon size={16} /></Button>
          </div>
        </Card>
      )}

      {orderDetails && (
        <Card title="Order Details" variant="elevated">
          <div className={styles.itemRow}>
            {orderDetails.items && orderDetails.items.length > 0 ? (
              orderDetails.items.map((item) => (
                <div key={item.id} className={styles.itemRow} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-borderLight, #F3F4F6)' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: DESIGN_TOKENS.colors.textSecondary, marginLeft: 8, fontSize: '0.875rem' }}>x{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{(item.price || 0) * (item.quantity || 1)}</span>
                </div>
              ))
            ) : (
              <p style={{ color: DESIGN_TOKENS.colors.textSecondary, textAlign: 'center', padding: '16px 0' }}>No item details available</p>
            )}
          </div>
          <div className={styles.totalRow}>
            <span>Total:</span>
            <span style={{ fontWeight: 700, color: DESIGN_TOKENS.colors.primary }}>₹{orderDetails.total || 0}</span>
          </div>
        </Card>
      )}

      {displayOrderStatus !== 'delivered' && (
        <div className={styles.contactSection}>
          <Button label="Contact Restaurant" onClick={handleContactRestaurant} variant="secondary" fullWidth />
        </div>
      )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><TrackingPage {...props} /></ProtectedRoute>;
}
