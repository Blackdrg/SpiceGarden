import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import styles from './referrals.module.css';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Referral {
  id: string;
  code: string;
  referrerReward?: number;
  status?: string;
}

interface ReferralHistory {
  totalSent?: number;
  totalCompleted?: number;
  totalEarned?: number;
  sentReferrals?: Referral[];
}

export default function LoyaltyReferrals() {
  const { data: history = {}, isLoading: loading } = useQuery<ReferralHistory>({
    queryKey: ['loyalty-referrals-demo-user'],
    queryFn: async () => {
      const response = await fetch(`${API}/loyalty/referrals/demo-user`);
      if (!response.ok) throw new Error('Failed to load referral history');
      return response.json() as Promise<ReferralHistory>;
    },
    initialData: {},
  });

  return (
    <div className={styles.container}>
      <Head><title>Referral Management - SpiceGarden</title></Head>
      <h1 className={styles.title}>Referral Management</h1>

      {loading ? (
        <p className={styles.loadingText}>Loading...</p>
      ) : (
        <div className={styles.grid}>
          {[
            { label: 'Total Sent', value: history?.totalSent || 0 },
            { label: 'Completed', value: history?.totalCompleted || 0 },
            { label: 'Total Earned', value: `₹${history?.totalEarned || 0}` },
          ].map((card) => (
            <div key={card.label} className={styles.card}>
              <div className={styles.cardLabel}>{card.label}</div>
              <div className={styles.cardValue}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {history?.sentReferrals && history.sentReferrals.length > 0 && (
        <div>
          <h2 className={styles.sectionHeader}>Recent Referrals</h2>
          <div className={styles.referralContainer}>
            {history.sentReferrals.slice(0, 10).map((r: Referral) => (
              <div key={r.id} className={styles.referralItem}>
                <div>
                  <span className={styles.referralCode}>{r.code}</span>
                  <span className={styles.referralReward}>Reward: ₹{r.referrerReward || 0}</span>
                </div>
                <span className={r.status === 'completed' ? styles.completedStatus : styles.pendingStatus}>{r.status || 'pending'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Link href="/loyalty" className={styles.backLink}>← Back</Link>
    </div>
  );
}
