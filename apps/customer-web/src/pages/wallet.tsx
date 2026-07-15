import React, { CSSProperties } from 'react';
import { Button, Card, DESIGN_TOKENS, useToast, Skeleton } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
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

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

const fetchWallet = async (): Promise<{ balance: number | null; transactions: Transaction[] }> => {
  const res = await fetch('/api/wallet');
  if (!res.ok) throw new Error('Failed to load wallet');
  const data = await res.json();
  return { balance: data.balance, transactions: data.transactions || [] };
};

const WalletPage = () => {
  const router = useRouter();
  const toast = useToast();
  const reduxUser = useSelector((state: any) => state.auth.user);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
  });
  const balance = data?.balance ?? null;
  const transactions = data?.transactions ?? [];

  const handleWithdraw = () => {
    toast.showToast({ message: 'Withdrawal feature coming soon', type: 'info', duration: 0 });
  };

  const addMoney = () => {
    toast.showToast({ message: 'Top-up feature coming soon', type: 'info', duration: 0 });
  };

  const displayBalance = balance !== null ? `₹${balance}` : '₹0.00';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My Wallet</h2>
        <p className={styles.pageSubtitle}>Manage your balance and transactions</p>
      </div>

      <Card variant="elevated">
        {loading ? (
          <div className={styles.balanceSection}>
            <Skeleton height={16} width="40%" style={{ marginBottom: 8 }} />
            <Skeleton height={40} width="50%" />
            <Skeleton height={14} width="30%" />
          </div>
        ) : (
          <div className={styles.balanceSection}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <h1 className={styles.balanceAmount}>{displayBalance}</h1>
            <p className={styles.balanceSuffix}>Ready to use</p>
          </div>
        )}
        <div className={styles.walletActions}>
          <Button onClick={addMoney}><ArrowDownIcon size={18} /></Button>
          <Button onClick={handleWithdraw} variant="secondary"><ArrowUpIcon size={18} /></Button>
        </div>
      </Card>

      <div className={styles.transactionSection}>
        <h3 className={styles.sectionTitle}>Transaction History</h3>
        <Card variant="default">
          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={48} style={{ marginBottom: 8 }} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>No transactions yet</p>
            </div>
          ) : (
            <div className={styles.transactionList}>
              {transactions.map((txn) => (
                <div key={txn.id} className={styles.transactionItem}>
                  <div className={styles.transactionInfo}>
                    <div className={styles.transactionDesc}>{txn.description}</div>
                    <div className={styles.transactionDate}>{new Date(txn.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                  </div>
                  <span className={`${styles.transactionAmount} ${txn.type === 'credit' ? styles.transactionCredit : styles.transactionDebit}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
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
            className={`${styles.navButton} ${tab.key === 'wallet' ? styles.navActive : styles.navInactive}`}
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
