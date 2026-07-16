import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, LoadingState } from '@spicegarden/ui';
import styles from './payouts.module.css';

type Payout = {
  id: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  platformCommission: number;
  gstAmount: number;
  netPayout: number;
  status: string;
  payoutDate?: string;
  orderBreakdown: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
  };
};

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = useCallback(async () => {
    try {
      const res = await fetch('/api/restaurant/ops/payout/history');
      if (res.ok) {
        const data = await res.json();
        setPayouts(data);
      }
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  if (loading) {
    return <div className={styles.loading}><LoadingState /></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Payouts</h1>
      <div className={styles.list}>
        {payouts.map((payout) => (
          <Card key={payout.id} title={`Payout ${new Date(payout.periodStart).toLocaleDateString()}`}>
            <div className={styles.grid}>
              <div>
                <span className={styles.label}>Gross Sales</span>
                <span className={styles.value}>₹{payout.grossSales.toFixed(2)}</span>
              </div>
              <div>
                <span className={styles.label}>Commission</span>
                <span className={styles.value}>₹{payout.platformCommission.toFixed(2)}</span>
              </div>
              <div>
                <span className={styles.label}>GST</span>
                <span className={styles.value}>₹{payout.gstAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className={styles.label}>Net Payout</span>
                <span className={styles.netValue}>₹{payout.netPayout.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.footer}>
              <span className={`${styles.status} ${styles[payout.status]}`}>{payout.status}</span>
              <span className={styles.orders}>{payout.orderBreakdown.completedOrders} orders completed</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PayoutsPage;
