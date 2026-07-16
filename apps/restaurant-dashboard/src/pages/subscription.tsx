import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, LoadingState, EmptyState } from '@spicegarden/ui';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import styles from './subscription.module.css';

type Plan = {
  id: string;
  planType: string;
  name: string;
  description: string;
  monthlyPrice: number;
  commissionRate: number;
  features: Record<string, any>;
  trialDays: number;
};

type Subscription = {
  id: string;
  planId: string;
  planType: string;
  status: string;
  amount: number;
  billingCycle: string;
  currentPeriodEnd: string;
  isTrial: boolean;
  usage: Record<string, any>;
};

const SubscriptionPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const restaurantId = user?.id ?? null;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/restaurant/subscription/plans'),
        restaurantId ? fetch(`/api/restaurant/subscription/${restaurantId}`) : Promise.resolve({ ok: false } as Response),
      ]);

      if (plansRes.ok) setPlans(await plansRes.json());
      if (subRes.ok) setSubscription(await subRes.json());
    } catch {
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = useCallback(async (planId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/restaurant/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: 'monthly', restaurantId }),
      });
      if (!res.ok) throw new Error('Subscription failed');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [fetchData, restaurantId]);

  const handleUpgrade = useCallback(async (newPlanId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/restaurant/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlanId, restaurantId }),
      });
      if (!res.ok) throw new Error('Upgrade failed');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [fetchData, restaurantId]);

  if (loading) return <div className={styles.loading}><LoadingState /></div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Subscription Plan</h1>
      {error && <div className={styles.error}>{error}</div>}

      {subscription && (
        <Card title="Current Plan" className={styles.currentPlan}>
          <div className={styles.planHeader}>
            <h2>{subscription.planType}</h2>
            <span className={`${styles.status} ${styles[subscription.status]}`}>{subscription.status}</span>
          </div>
          <p className={styles.amount}>₹{subscription.amount} / {subscription.billingCycle}</p>
          {subscription.isTrial && <p className={styles.trial}>Trial ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>}
          <div className={styles.usage}>
            <h3>Usage</h3>
            <pre>{JSON.stringify(subscription.usage, null, 2)}</pre>
          </div>
        </Card>
      )}

      <div className={styles.plansGrid}>
        {plans.map(plan => (
          <Card key={plan.id} title={plan.name} className={styles.planCard}>
            <p className={styles.description}>{plan.description}</p>
            <p className={styles.price}>₹{plan.monthlyPrice}/mo</p>
            <p className={styles.commission}>Commission: {plan.commissionRate}%</p>
            <ul className={styles.features}>
              {Object.entries(plan.features || {}).reduce<string[]>((acc, [, v]) => { if (v) acc.push(typeof v === 'string' ? v : String(v)); return acc; }, []).map((featureKey) => (
                <li key={featureKey}>{featureKey}</li>
              ))}
            </ul>
            {subscription ? (
              <Button onClick={() => handleUpgrade(plan.id)} disabled={actionLoading} variant="primary">
                Upgrade
              </Button>
            ) : (
              <Button onClick={() => handleSubscribe(plan.id)} disabled={actionLoading} variant="primary">
                Subscribe
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
