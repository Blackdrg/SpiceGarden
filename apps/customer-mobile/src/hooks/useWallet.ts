import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  walletService,
  formatWalletAmount,
  Wallet,
  WalletTransaction,
} from '../services/wallet.service';

const DEFAULT_LIMIT = 20;

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadWallet = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const [walletData, txnData] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(pageNum, DEFAULT_LIMIT),
      ]);

      setWallet(walletData);
      setBalance(walletData.balance);
      setCurrency(walletData.currency || 'INR');
      setTransactions((prev) =>
        append ? [...prev, ...txnData.transactions] : txnData.transactions
      );
      setHasMore(txnData.hasMore);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to load wallet');
      return false;
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadWallet(1);
  }, [loadWallet]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const next = page + 1;
      setPage(next);
      loadWallet(next, true);
    }
  }, [hasMore, loadingMore, page, loadWallet]);

  const handleRetry = useCallback(async () => {
    setPage(1);
    await loadWallet(1);
  }, [loadWallet]);

  const formattedBalance = useMemo(
    () => formatWalletAmount(balance, currency),
    [balance, currency]
  );

  return {
    wallet,
    transactions,
    balance,
    currency,
    formattedBalance,
    loading,
    refreshing,
    loadingMore,
    error,
    page,
    hasMore,
    onRefresh,
    loadMore,
    handleRetry,
  };
};
