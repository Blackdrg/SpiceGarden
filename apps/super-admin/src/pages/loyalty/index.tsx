import Link from 'next/link';
import styles from './loyaltyIndex.module.css';

export default function LoyaltyIndex() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Loyalty & Growth Engine</h1>
      <div className={styles.grid}>
        {[
          { label: 'Active Coupons', value: '12', href: '/loyalty/coupons' },
          { label: 'Total Referrals', value: '248', href: '/loyalty/referrals' },
          { label: 'Subscriptions', value: '89', href: '/loyalty' },
        ].map((card) => (
          <a key={card.label} href={card.href} className={styles.link}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>{card.label}</div>
              <div className={styles.cardValue}>{card.value}</div>
            </div>
          </a>
        ))}
      </div>
      <Link href="/" className={styles.backLink}>← Back to Dashboard</Link>
    </div>
  );
}
