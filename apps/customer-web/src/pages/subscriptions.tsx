import React, { useEffect, useState } from 'react';
import { Button, Card, DESIGN_TOKENS, LoadingState, EmptyState } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { StarIcon, HomeIcon, SearchIcon, UserIcon } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './subscriptions.module.css';

type Plan = {
  id: string;
  planType: string;
  name: string;
  description: string;
  monthlyPrice: number;
  quarterlyPrice?: number;
  annualPrice?: number;
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
  benefits: Record<string, any>;
};

const SubscriptionsPage = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [plansRes, subRes] = await Promise.all([
        fetch('/api/customer/subscription/plans'),
        fetch('/api/customer/subscription/me'),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
    } catch (err) {
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      setError(null);

      const res = await fetch('/api/customer/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: 'monthly' }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to subscribe');
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setSubscribing(true);
      setError(null);

      const res = await fetch('/api/customer/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to cancel');
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <LoadingState label="Loading subscriptions..." />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My Subscriptions</h2>
        <p className={styles.pageSubtitle}>Manage your active plans</p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
          <button onClick={() => setError(null)} className={styles.errorClose}>×</button>
        </div>
      )}

      {subscription && (
        <Card title="SpiceGarden Prime" variant="elevated" className={styles.activeCard}>
          <div className={styles.priceWrapper}>
            <div className={styles.priceInfo}>
              <span className={styles.price}>₹{subscription.amount}</span>
              <span className={styles.priceLabel}> / {subscription.billingCycle}</span>
            </div>
            <span className={styles.statusActive}>ACTIVE</span>
          </div>
          <ul className={styles.benefits}>
            {(subscription.benefits?.freeDelivery && <li className={styles.benefitItem}>Free Delivery on All Orders</li>)}
            {(subscription.benefits?.prioritySupport && <li className={styles.benefitItem}>Priority Customer Support</li>)}
            {(subscription.benefits?.cashbackPercentage && <li className={styles.benefitItem}>Extra {subscription.benefits.cashbackPercentage}% Off Every Order</li>)}
            {(subscription.benefits?.exclusiveCoupons && <li className={styles.benefitItem}>Exclusive Coupons</li>)}
          </ul>
          <div className={styles.cardFooter}>
            <span className={styles.nextBilling}>
              {subscription.isTrial ? 'Trial ends' : 'Renews'} on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
            <Button
              label="Cancel"
              onClick={handleCancel}
              variant="secondary"
              size="sm"
              disabled={subscribing}
            />
          </div>
        </Card>
      )}

      {!subscription && (
        <div className={styles.plansList}>
          <h3 className={styles.plansTitle}>Choose a Plan</h3>
          {plans.map((plan) => (
            <Card key={plan.id} title={plan.name} variant="elevated">
              <p className={styles.planDescription}>{plan.description}</p>
              <div className={styles.priceWrapper}>
                <div className={styles.priceInfo}>
                  <span className={styles.price}>₹{plan.monthlyPrice}</span>
                  <span className={styles.priceLabel}> / month</span>
                </div>
                {plan.trialDays > 0 && (
                  <span className={styles.trialBadge}>{plan.trialDays} days free trial</span>
                )}
              </div>
              <ul className={styles.benefits}>
                {plan.features?.freeDelivery && <li className={styles.benefitItem}>Free Delivery</li>}
                {plan.features?.prioritySupport && <li className={styles.benefitItem}>Priority Support</li>}
                {plan.features?.exclusiveCoupons && <li className={styles.benefitItem}>Exclusive Coupons</li>}
                {plan.features?.gstReports && <li className={styles.benefitItem}>GST Reports</li>}
                {plan.features?.analytics && <li className={styles.benefitItem}>Advanced Analytics</li>}
              </ul>
              <div className={styles.cardFooter}>
                <Button
                  label="Subscribe"
                  onClick={() => handleSubscribe(plan.id)}
                  variant="primary"
                  size="md"
                  disabled={subscribing}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <nav className={styles.bottomNav} aria-label="Main navigation">
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIcon, path: '/search' },
          { key: 'subs', label: 'Subs', icon: StarIcon, path: '/subscriptions' },
          { key: 'account', label: 'Account', icon: UserIcon, path: '/profile' },
        ].map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={styles.navItem}
              onClick={() => tab.path && router.push(tab.path)}
              aria-label={tab.label}
            >
              <span className={styles.navIcon}><tab.icon size={20} /></span>
              <span>{tab.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><SubscriptionsPage {...props} /></ProtectedRoute>;
}
