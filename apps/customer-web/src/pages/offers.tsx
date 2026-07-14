import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS, HomeIcon, SearchIcon, ProfileIcon, Skeleton } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { GiftIcon, Share2Icon, CopyIcon, CheckIcon } from 'lucide-react';
import styles from './offers.module.css';

interface Offer {
  id: string;
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
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/offers');
        if (res.ok) {
          const data = await res.json();
          setOffers(data);
        }
      } catch {
        // keep empty state on error
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  useEffect(() => {
    if (copiedId === null) return;
    const timer = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedId]);

  const getTabClass = (key: string) => {
    return `${styles.tabItem} ${key === 'offers' ? styles.activeTab : styles.tabText}`;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Offers & Promos</h2>
        <p className={styles.pageSubtitle}>Save more on every order</p>
      </div>

      <div className={styles.cardList}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} variant="elevated">
              <Skeleton height={20} width="60%" style={{ marginBottom: 8 }} />
              <Skeleton height={14} width="80%" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <Skeleton height={36} width={100} />
                <Skeleton height={36} width={80} />
              </div>
            </Card>
          ))
        ) : offers.length === 0 ? (
          <Card variant="default">
            <p>No offers available right now</p>
          </Card>
        ) : (
          offers.map((offer) => (
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
                  onClick={() => {
                    copyCode(offer.code);
                    setCopiedId(offer.id);
                  }}
                  variant="secondary"
                />
                <Button label="Use Now" onClick={() => router.push('/')} />
              </div>
            </Card>
          ))
        )}
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
