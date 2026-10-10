import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HomeIcon, SearchIcon, OrderIcon, ProfileIcon } from '@spicegarden/ui';
import { Tag, Sparkles, Copy, Share2, Check } from 'lucide-react';
import styles from './offers.module.css';

interface Offer {
  id: number;
  title: string;
  description: string;
  code: string;
  discount: string;
  validTill: string;
}

const OFFERS: Offer[] = [
  {
    id: 1,
    title: 'Flat 50% Off Welcome Deal',
    description: 'Valid on first 3 orders above ₹199. Max discount ₹150.',
    code: 'WELCOME50',
    discount: '50% OFF',
    validTill: '31 Oct 2026',
  },
  {
    id: 2,
    title: 'Flat ₹100 Off on Gourmet Feasts',
    description: 'Valid on orders above ₹499 across all partnered restaurants.',
    code: 'SAVE100',
    discount: '₹100 OFF',
    validTill: '15 Nov 2026',
  },
  {
    id: 3,
    title: 'Buy 1 Get 1 Free (Biryani Fest)',
    description: 'Order any Handi Biryani and get complimentary Starter.',
    code: 'BOGOFEAST',
    discount: 'BOGO FREE',
    validTill: '20 Oct 2026',
  },
  {
    id: 4,
    title: 'Weekend Party Pack ₹200 Off',
    description: 'Applicable on family orders above ₹999 on Sat & Sun.',
    code: 'PARTY200',
    discount: '₹200 OFF',
    validTill: '30 Nov 2026',
  },
];

export default function OffersPage() {
  const router = useRouter();

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    alert(`🎉 Coupon "${code}" copied to clipboard! Paste it at checkout.`);
  };

  const handleUseNow = (code: string) => {
    sessionStorage.setItem('autoApplyCoupon', code);
    router.push('/');
  };

  const handleShare = () => {
    const text = 'Use my SpiceGarden referral code "SPICE2026" to get ₹100 off your first food order!';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    alert('🔗 Referral link and code copied to clipboard!');
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Offers &amp; Promo Codes | SpiceGarden</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Coupons &amp; Deals</h1>
          <span style={{ fontSize: 13, color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={16} /> Best Savings
          </span>
        </div>

        {/* Offers List */}
        <div className={styles.cardList}>
          {OFFERS.map((offer) => (
            <div key={offer.id} className={styles.offerCard}>
              <div className={styles.offerCardHeader}>
                <div>
                  <h2 className={styles.offerTitle}>{offer.title}</h2>
                  <p className={styles.offerDesc}>{offer.description}</p>
                </div>
                <span className={styles.discountBadge}>{offer.discount}</span>
              </div>

              <div className={styles.codeRow}>
                <span className={styles.codeBlock}>{offer.code}</span>
                <span className={styles.validTill}>Valid till {offer.validTill}</span>
              </div>

              <div className={styles.btnRow}>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopyCode(offer.code)}
                >
                  <Copy size={14} style={{ marginRight: 4 }} /> Copy Code
                </button>
                <button
                  type="button"
                  className={styles.useBtn}
                  onClick={() => handleUseNow(offer.code)}
                >
                  Apply &amp; Order →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Refer & Earn */}
        <div className={styles.referCard}>
          <h3 className={styles.referTitle}>🎁 Refer &amp; Earn ₹100</h3>
          <p className={styles.referDesc}>
            Share your invite code with friends. You both get ₹100 wallet cashback on their first completed order!
          </p>
          <div className={styles.referCodeRow}>
            <div className={styles.referCode}>SPICE2026</div>
            <button type="button" className={styles.shareBtn} onClick={handleShare}>
              <Share2 size={16} style={{ marginRight: 6 }} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className={styles.bottomNav}>
        {[
          { key: 'home', label: 'Home', Icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', Icon: SearchIcon, path: '/search' },
          { key: 'orders', label: 'Orders', Icon: OrderIcon, path: '/history' },
          { key: 'account', label: 'Profile', Icon: ProfileIcon, path: '/profile' },
        ].map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.navButton} ${styles.navInactive}`}
              onClick={() => router.push(tab.path)}
            >
              <Icon size={22} color="#64748b" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
