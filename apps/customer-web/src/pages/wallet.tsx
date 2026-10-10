import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HomeIcon, SearchIcon, OrderIcon, ProfileIcon } from '@spicegarden/ui';
import { Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './wallet.module.css';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

const INITIAL_TXNS: Transaction[] = [
  { id: 'tx-1', type: 'credit', amount: 500, description: 'Welcome Cashback Bonus', date: 'Today, 10:30 AM' },
  { id: 'tx-2', type: 'debit', amount: 347, description: 'Order #SG-729104 (Punjabi Dhaba)', date: 'Yesterday, 8:22 PM' },
  { id: 'tx-3', type: 'credit', amount: 100, description: 'Referral Reward (Friend Joined)', date: 'Oct 05, 2026' },
  { id: 'tx-4', type: 'credit', amount: 250, description: 'Card Top-up', date: 'Oct 01, 2026' },
];

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(500);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TXNS);

  const handleAddMoney = (amount: number) => {
    setBalance((prev) => prev + amount);
    const newTxn: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount,
      description: 'Quick Balance Top-up',
      date: 'Just now',
    };
    setTransactions((prev) => [newTxn, ...prev]);
    alert(`🎉 Successfully added ₹${amount} to your SpiceGarden Wallet!`);
  };

  const handlePromptAddMoney = () => {
    const custom = prompt('Enter amount to add to wallet (₹):', '200');
    if (custom && !isNaN(Number(custom)) && Number(custom) > 0) {
      handleAddMoney(Number(custom));
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>My Wallet | SpiceGarden</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>SpiceGarden Wallet</h1>
          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={16} /> 100% Secure
          </span>
        </div>

        {/* Hero Card */}
        <div className={styles.walletHeroCard}>
          <p className={styles.walletBalanceLabel}>Available Balance</p>
          <h2 className={styles.walletBalanceAmount}>₹{balance.toLocaleString()}</h2>

          <p style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 10, fontWeight: 600 }}>
            ⚡ Instant 1-Click Top Up:
          </p>
          <div className={styles.quickTopupRow}>
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                className={styles.topupChip}
                onClick={() => handleAddMoney(amt)}
              >
                +₹{amt}
              </button>
            ))}
          </div>

          <div className={styles.walletActions}>
            <button type="button" className={styles.addMoneyBtn} onClick={handlePromptAddMoney}>
              <Plus size={18} /> Add Custom Money
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className={styles.historyCard}>
          <h3 className={styles.historyTitle}>Recent Activity</h3>
          <div className={styles.txnList}>
            {transactions.map((tx) => (
              <div key={tx.id} className={styles.txnRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: tx.type === 'credit' ? '#dcfce7' : '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tx.type === 'credit' ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <h4 className={styles.txnTitle}>{tx.description}</h4>
                    <p className={styles.txnDate}>{tx.date}</p>
                  </div>
                </div>

                <span className={tx.type === 'credit' ? styles.txnCredit : styles.txnDebit}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </span>
              </div>
            ))}
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
          const isActive = tab.key === 'account';
          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.navButton} ${isActive ? styles.navActive : styles.navInactive}`}
              onClick={() => router.push(tab.path)}
            >
              <Icon size={22} color={isActive ? '#ff5a1f' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
