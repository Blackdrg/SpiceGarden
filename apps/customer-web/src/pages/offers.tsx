import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import styles from './offers.module.css';

interface Offer {
  id: number;
  title: string;
  description: string;
  code: string;
  validTill: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  minOrder: number;
}

const OffersPage = () => {
  const router = useRouter();
  const [offers] = useState<Offer[]>([
    { id: 1, title: 'Flat 50% Off', description: 'On your first 3 orders', code: 'WELCOME50', validTill: '2026-06-30', type: 'percentage', value: 50, minOrder: 199 },
    { id: 2, title: '₹100 Off', description: 'On orders above ₹499', code: 'SAVE100', validTill: '2026-05-31', type: 'fixed', value: 100, minOrder: 499 },
    { id: 3, title: 'Buy 1 Get 1 Free', description: 'On selected pizzas', code: 'PIZZABOGO', validTill: '2026-06-15', type: 'bogo', value: 0, minOrder: 0 },
  ]);
  const [activeTab] = useState<'home' | 'search' | 'offers' | 'account'>('offers');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => null);
  };

  const getDiscountText = (offer: Offer) => {
    if (offer.type === 'percentage') return `-${offer.value}%`;
    if (offer.type === 'fixed') return `-₹${offer.value}`;
    return 'BOGO';
  };

  const getTabClass = (key: string) => {
    return `${styles.tabItem} ${activeTab === key ? styles.activeTab : styles.tabText}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Offers &amp; Promos</h2>

      <div className={styles.cardList}>
        {offers.map((offer) => (
          <Card key={offer.id} title={offer.title} isElevated>
            <p className={styles.description}>{offer.description}</p>
            <div className={styles.discountBadge}>
              <span className={styles.discountText}>{getDiscountText(offer)}</span>
            </div>
            <div className={styles.codeRow}>
              <div className={styles.codeBlock}>{offer.code}</div>
              <span className={styles.validTill}>Valid till {offer.validTill}</span>
            </div>
            <div className={styles.buttonRow}>
              <Button label="Copy Code" onClick={() => copyCode(offer.code)} variant="secondary" />
              <Button label="Use Now" onClick={() => router.push('/')} />
            </div>
          </Card>
        ))}
      </div>

      <Card title="Refer &amp; Earn" isElevated className={styles.referMargin}>
        <p className={styles.referDescription}>Share your code — earn &#8377;100 for every friend's first order.</p>
        <div className={styles.buttonRow}>
          <div className={styles.shareCode}>SPICE123</div>
          <Button label="Share" onClick={() => null} />
        </div>
      </Card>

      <nav className={styles.bottomNav} aria-label="Main navigation">
        {[
          { key: 'home', label: 'Home', icon: '🏠', path: '/' },
          { key: 'search', label: 'Search', icon: '🔍', path: '/search' },
          { key: 'offers', label: 'Offers', icon: '🎁', path: '/offers' },
          { key: 'account', label: 'Account', icon: '👤', path: '/profile' },
        ].map((tab) => (
          <div
            key={tab.key}
            className={getTabClass(tab.key)}
            onClick={() => tab.path && router.push(tab.path)}
            aria-label={tab.label}
            role="button"
            tabIndex={0}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default OffersPage;
