import React, { useState, CSSProperties } from 'react';
import { Button, Card, DESIGN_TOKENS, useToast } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { WalletIcon, ArrowDownIcon, ArrowUpIcon, HomeIcon, SearchIcon, UserIcon } from 'lucide-react';
import styles from './wallet.module.css';

const bottomNavStyle: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 64,
  backgroundColor: 'var(--color-surface, #FFFFFF)',
  borderTop: '1px solid var(--color-borderLight, #F3F4F6)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  boxShadow: 'var(--shadow-small)',
  zIndex: 100,
};

const WalletPage = () => {
  const router = useRouter();
  const toast = useToast();
  const [balance, setBalance] = useState(500);

  const handleWithdraw = () => {
    toast.showToast({ message: 'Withdrawal feature coming soon', type: 'info', duration: 0 });
  };
  const [transactionHistory] = useState([
    { id: 1, type: 'credit' as const, amount: 500, description: 'Welcome Bonus', date: '2026-05-20' },
    { id: 2, type: 'debit' as const, amount: 347, description: 'Order #SG12345', date: '2026-05-21' },
    { id: 3, type: 'credit' as const, amount: 100, description: 'Referral Bonus', date: '2026-05-22' },
    { id: 4, type: 'debit' as const, amount: 30, description: 'Order #SG12344', date: '2026-05-18' },
    { id: 5, type: 'credit' as const, amount: 200, description: 'Top-up', date: '2026-05-15' },
  ]);
  const [activeTab] = useState<'home' | 'search' | 'wallet' | 'account'>('wallet');

  const addMoney = () => {
    setBalance((prev) => prev + 100);
    toast.showToast({ message: '₹100 added to your wallet', type: 'success', duration: 3000 });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My Wallet</h2>
        <p className={styles.pageSubtitle}>Manage your balance and transactions</p>
      </div>

      <Card variant="elevated">
        <div className={styles.balanceSection}>
          <p className={styles.balanceLabel}>Available Balance</p>
          <h1 className={styles.balanceAmount}>₹{balance}</h1>
          <p className={styles.balanceSuffix}>Ready to use</p>
        </div>
        <div className={styles.walletActions}>
          <Button onClick={addMoney}><ArrowDownIcon size={18} /></Button>
          <Button onClick={handleWithdraw} variant="secondary"><ArrowUpIcon size={18} /></Button>
        </div>
      </Card>

      <div className={styles.transactionSection}>
        <h3 className={styles.sectionTitle}>Transaction History</h3>
        <Card variant="default">
          <div className={styles.transactionList}>
            {transactionHistory.map((txn) => (
              <div key={txn.id} className={styles.transactionItem}>
                <div className={styles.transactionInfo}>
                  <div className={styles.transactionDesc}>{txn.description}</div>
                  <div className={styles.transactionDate}>{txn.date}</div>
                </div>
                <span className={`${styles.transactionAmount} ${txn.type === 'credit' ? styles.transactionCredit : styles.transactionDebit}`}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom nav */}
      <nav style={bottomNavStyle}>
        {[
          { key: 'home', label: 'Home', icon: HomeIcon, path: '/' },
          { key: 'search', label: 'Search', icon: SearchIcon, path: '/search' },
          { key: 'wallet', label: 'Wallet', icon: WalletIcon, path: '/wallet' },
          { key: 'account', label: 'Account', icon: UserIcon, path: '/profile' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => tab.path && router.push(tab.path)}
            className={`${styles.navButton} ${activeTab === tab.key ? styles.navActive : styles.navInactive}`}
            aria-label={tab.label}
          >
            <span className={styles.navIcon}><tab.icon size={22} /></span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default WalletPage;
