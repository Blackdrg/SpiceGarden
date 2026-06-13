import React, { useEffect, useState } from 'react';
import { Button, Card } from '@spicegarden/ui';
import { useTracking } from '../hooks/useTracking';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ordersApi } from '@spicegarden/shared/api';
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const { location } = useTracking(orderId || 'driver-123');
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [orderDetails, setOrderDetails] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order ID from query params or local storage
    const queryOrderId = router.query.order as string | undefined;
    if (queryOrderId) {
      setOrderId(queryOrderId);
    } else {
      // Try to get from localStorage as fallback
      const storedOrderId = localStorage.getItem('lastOrderId');
      if (storedOrderId) {
        setOrderId(storedOrderId);
      }
    }
  }, [router.query]);

useEffect(() => {
     if (orderId) {
       const loadOrderDetails = async () => {
         try {
           setLoading(true);
           const response = await ordersApi.get(orderId, user?.token || localStorage.getItem('sg_token') || '');
           const order = response.data as TrackingOrder;
           setOrderDetails(order);
           setOrderStatus(order.status || 'preparing');
          // Update estimated time based on order status
           switch (order.status) {
             case 'preparing':
               setEstimatedTime(10 + Math.floor(Math.random() * 10));
               break;
             case 'ready':
               setEstimatedTime(5 + Math.floor(Math.random() * 5));
               break;
             case 'pickedup':
               setEstimatedTime(8 + Math.floor(Math.random() * 12));
               break;
             case 'delivered':
               setEstimatedTime(0);
               break;
             default:
               setEstimatedTime(15);
           }
         } catch (error) {
           console.error('Failed to load order details:', error);
           // Use mock data for demo
           setOrderDetails({
             id: orderId,
             status: 'preparing',
             items: [],
             total: 0
           });
         } finally {
           setLoading(false);
         }
       };
       loadOrderDetails();
     }
   }, [orderId, user?.token]);

  const statusSteps = [
    { id: 'placed', label: 'Order Placed', done: true },
    { id: 'preparing', label: 'Preparing', done: orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'ready', label: 'Ready for Pickup', done: orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'pickedup', label: 'Picked Up', done: orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'delivered', label: 'Delivered', done: orderStatus === 'delivered' },
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
            <p className={styles.eta}>ETA: {estimatedTime} mins</p>
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

export default TrackingPage;