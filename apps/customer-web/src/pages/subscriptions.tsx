import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import styles from './subscriptions.module.css';
import ProtectedRoute from '../components/ProtectedRoute';

type SubscriptionStyles = typeof styles;

interface Subscription {
  id: number;
  name: string;
  price: number;
  benefits: string[];
  active: boolean;
  nextBilling: string;
}

const getStatusClass = (styles: SubscriptionStyles, isActive: boolean) => {
  return `${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`;
};

const SubscriptionsPage = () => {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: 1, name: 'SpiceGarden Prime', price: 99, benefits: ['Free Delivery on All Orders', 'Priority Customer Support', 'Extra 5% Off Every Order'], active: true, nextBilling: '2026-06-15' },
    { id: 2, name: 'Weekly Meal Plan', price: 199, benefits: ['4 Chef-Selected Meals/Week', 'Skip Any Week', 'Partner Restaurant Priority'], active: false, nextBilling: '2026-06-01' },
  ]);
  const [activeTab] = useState<'home' | 'search' | 'subs' | 'account'>('subs');

  const toggleSubscription = (id: number) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const getNavClass = (key: string) => {
    return `${styles.navItem} ${activeTab === key ? styles.navItemActive : styles.navLabel}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>My Subscriptions</h2>

      <div className={styles.cardList}>
        {subscriptions.map((sub) => (
          <Card key={sub.id} title={sub.name} isElevated>
            <div className={styles.priceWrapper}>
              <div className={styles.priceInfo}>
                <span className={styles.price}>&#8377;{sub.price}</span>
                <span className={styles.priceLabel}> / month</span>
              </div>
              <span className={getStatusClass(styles, sub.active)}>{sub.active ? 'ACTIVE' : 'INACTIVE'}</span>
            </div>
            <ul className={styles.benefits}>
              {sub.benefits.map((b) => <li key={`${sub.id}-${b}`} className={styles.benefitItem}>{b}</li>)}
            </ul>
            <div className={styles.cardFooter}>
              <span className={styles.nextBilling}>Next billing: {sub.nextBilling}</span>
              <Button label={sub.active ? 'Cancel' : 'Activate'} onClick={() => toggleSubscription(sub.id)} variant={sub.active ? 'secondary' : 'primary'} />
            </div>
          </Card>
        ))}
      </div>

<Card title="Explore More Plans" isElevated style={{ marginBottom: 8 }}>
         <p className={styles.exploreText}>Save on every order. Gold, Premium, Family options available.</p>
         <Button label="View All Plans" onClick={() => null} />
       </Card>

      <nav className={styles.bottomNav} aria-label="Main navigation">
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'subs', label: 'Subs', icon: '⭐', path: '/subscriptions' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={getNavClass(tab.key)}
              onClick={() => tab.path && router.push(tab.path)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.path && router.push(tab.path); } }}
              aria-label={tab.label}
            >
            <span className={styles.navIcon}>{tab.icon}</span>
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
