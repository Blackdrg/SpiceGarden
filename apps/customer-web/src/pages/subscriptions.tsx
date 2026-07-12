import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { StarIcon, HomeIcon, SearchIcon, UserIcon } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './subscriptions.module.css';

type Subscription = {
  id: number;
  name: string;
  price: number;
  benefits: string[];
  active: boolean;
  nextBilling: string;
};

const getStatusClass = (isActive: boolean) => {
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
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My Subscriptions</h2>
        <p className={styles.pageSubtitle}>Manage your active plans</p>
      </div>

      <div className={styles.cardList}>
        {subscriptions.map((sub) => (
          <Card key={sub.id} title={sub.name} variant="elevated">
            <div className={styles.priceWrapper}>
              <div className={styles.priceInfo}>
                <span className={styles.price}>₹{sub.price}</span>
                <span className={styles.priceLabel}> / month</span>
              </div>
              <span className={getStatusClass(sub.active)}>{sub.active ? 'ACTIVE' : 'INACTIVE'}</span>
            </div>
            <ul className={styles.benefits}>
              {sub.benefits.map((b) => <li key={`${sub.id}-${b}`} className={styles.benefitItem}>{b}</li>)}
            </ul>
            <div className={styles.cardFooter}>
              <span className={styles.nextBilling}>Next billing: {sub.nextBilling}</span>
              <Button
                label={sub.active ? 'Cancel' : 'Activate'}
                onClick={() => toggleSubscription(sub.id)}
                variant={sub.active ? 'secondary' : 'primary'}
                size="sm"
              />
            </div>
          </Card>
        ))}
      </div>

      <Card variant="interactive" style={{ background: 'linear-gradient(135deg, var(--color-premiumLight, #FDF6E3) 0%, #FEF3C7 100%)', border: '1px solid var(--color-premium, #D4AF37)33' }}>
        <div className={styles.exploreTitle}>
          <StarIcon size={18} color={DESIGN_TOKENS.colors.premium} style={{ display: 'inline', marginRight: 8 }} />
          Explore More Plans
        </div>
        <p className={styles.exploreText}>Save on every order. Gold, Premium, Family options available.</p>
        <Button label="View All Plans" onClick={() => null} variant="secondary" />
      </Card>

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
              className={getNavClass(tab.key)}
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
