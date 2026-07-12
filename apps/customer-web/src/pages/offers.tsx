import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS, HomeIcon, SearchIcon, ProfileIcon } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { GiftIcon, Share2Icon, CopyIcon, CheckIcon } from 'lucide-react';
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

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code).catch(() => null);
};

const getDiscountText = (offer: Offer) => {
  if (offer.type === 'percentage') return `-${offer.value}%`;
  if (offer.type === 'fixed') return `-₹${offer.value}`;
  return 'BOGO';
};

const getDiscountClass = (type: string) => {
  switch (type) {
    case 'percentage': return styles.discountPercent;
    case 'fixed': return styles.discountFixed;
    default: return styles.discountBogo;
  }
};

const OffersPage = () => {
  const router = useRouter();
  const [offers] = useState<Offer[]>([
    { id: 1, title: 'Flat 50% Off', description: 'On your first 3 orders', code: 'WELCOME50', validTill: '2026-06-30', type: 'percentage', value: 50, minOrder: 199 },
    { id: 2, title: '₹100 Off', description: 'On orders above ₹499', code: 'SAVE100', validTill: '2026-05-31', type: 'fixed', value: 100, minOrder: 499 },
    { id: 3, title: 'Buy 1 Get 1 Free', description: 'On selected pizzas', code: 'PIZZABOGO', validTill: '2026-06-15', type: 'bogo', value: 0, minOrder: 0 },
  ]);
  const [activeTab] = useState<'home' | 'search' | 'offers' | 'account'>('offers');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (code: string, id: number) => {
    copyCode(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTabClass = (key: string) => {
    return `${styles.tabItem} ${activeTab === key ? styles.activeTab : styles.tabText}`;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Offers & Promos</h2>
        <p className={styles.pageSubtitle}>Save more on every order</p>
      </div>

      <div className={styles.cardList}>
        {offers.map((offer) => (
          <Card key={offer.id} title={offer.title} variant="elevated">
            <p className={styles.offerDesc}>{offer.description}</p>
            <div className={styles.offerHeader}>
              <div className={styles.codeRow}>
                <div className={styles.codeBlock}>{offer.code}</div>
                <span className={styles.validTill}>Valid till {offer.validTill}</span>
              </div>
              <span className={`${styles.discountBadge} ${getDiscountClass(offer.type)}`}>
                {getDiscountText(offer)}
              </span>
            </div>
            <div className={styles.buttonRow}>
              <Button
                label={copiedId === offer.id ? 'Copied!' : 'Copy Code'}
                onClick={() => handleCopy(offer.code, offer.id)}
                variant="secondary"
              />
              <Button label="Use Now" onClick={() => router.push('/')} />
            </div>
          </Card>
        ))}
      </div>

      <Card variant="interactive" style={{ background: 'linear-gradient(135deg, var(--color-primary, #FF5A1F) 0%, #FF8A65 100%)', border: 'none', color: 'white' }}>
        <div className={styles.referTitle}>
          <GiftIcon size={20} style={{ display: 'inline', marginRight: 8 }} />
          Refer & Earn
        </div>
        <p className={styles.referDesc}>Share your code — earn ₹100 for every friend&apos;s first order.</p>
        <div className={styles.buttonRow}>
          <div className={styles.shareCode}>SPICE123</div>
          <Button label="Share" onClick={() => null} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} />
        </div>
      </Card>

      <nav className={styles.bottomNav} aria-label="Main navigation">
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIcon, path: '/search' },
          { key: 'offers', label: 'Offers', icon: GiftIcon, path: '/offers' },
          { key: 'account', label: 'Account', icon: ProfileIcon, path: '/profile' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.key}
            className={getTabClass(tab.key)}
            onClick={() => tab.path && router.push(tab.path)}
            aria-label={tab.label}
          >
            <span className={styles.tabIcon}><tab.icon size={20} /></span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OffersPage;
