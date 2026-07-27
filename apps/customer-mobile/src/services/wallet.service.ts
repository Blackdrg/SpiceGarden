import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeParse } from '../utils/safe-parse';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { API_URL } from '../constants/api';

export type WalletTransactionType =
  | 'credit'
  | 'debit'
  | 'refund'
  | 'cashback'
  | 'order_payment'
  | 'cod_collection'
  | 'compensation';

export interface WalletTransaction {
  id: string;
  amount: number;
  type: WalletTransactionType;
  description: string;
  balanceAfter: number;
  referenceId?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  updatedAt: string;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  total: number;
  hasMore: boolean;
}

export interface AddMoneyResult {
  id: string;
  amount: number;
  currency: string;
  clientSecret?: string;
  paymentUrl?: string;
}

const WALLET_CACHE_TTL = 2 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

async function getAuthHeaders(): Promise<{ [key: string]: string }> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  const attempt = async (n: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = body?.message || body?.error || `Request failed (${response.status})`;
        const err: any = new Error(message);
        err.status = response.status;
        throw err;
      }
      return response;
    } catch (error) {
      if (n >= retries || (error as any).status) throw error;
      const delay = RETRY_DELAY_BASE * Math.pow(2, n - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return attempt(n + 1);
    }
  };
  return attempt(1);
}

const getCachedWallet = async (): Promise<Wallet | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_CACHE);
    if (!json) return null;
    const cached = safeParse(json) as { wallet: Wallet; timestamp: number } | undefined;
    if (cached && Date.now() - cached.timestamp < WALLET_CACHE_TTL) {
      return cached.wallet;
    }
    return null;
  } catch {
    return null;
  }
};

const setCachedWallet = async (wallet: Wallet): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.WALLET_CACHE,
      JSON.stringify({ wallet, timestamp: Date.now() })
    );
  } catch {
    /* cache is best-effort */
  }
};

const cacheTransactions = async (
  txns: WalletTransaction[],
  page: number
): Promise<void> => {
  if (page !== 1) return;
  try {
    const existing = safeParse(
      (await AsyncStorage.getItem(STORAGE_KEYS.WALLET_TXN_CACHE)) || '[]'
    ) as WalletTransaction[] | undefined;
    const merged = [...txns, ...(existing || [])].filter(
      (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.WALLET_TXN_CACHE,
      JSON.stringify(merged.slice(0, 50))
    );
  } catch {
    /* best-effort */
  }
};

export const walletService = {
  async getWallet(): Promise<Wallet> {
    try {
      const response = await fetchWithRetry(`${API_URL}/wallet`, {
        headers: await getAuthHeaders(),
      });
      const wallet = (await response.json()) as Wallet;
      await setCachedWallet(wallet);
      return wallet;
    } catch (error) {
      const cached = await getCachedWallet();
      if (cached) return cached;
      throw error;
    }
  },

  async getBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const response = await fetchWithRetry(`${API_URL}/wallet/balance`, {
        headers: await getAuthHeaders(),
      });
      return response.json();
    } catch (error) {
      const cached = await getCachedWallet();
      if (cached) return { balance: cached.balance, currency: cached.currency };
      throw error;
    }
  },

  async getTransactions(
    page = 1,
    limit = 20
  ): Promise<WalletTransactionsResponse> {
    try {
      const response = await fetchWithRetry(
        `${API_URL}/wallet/transactions?limit=${limit}&offset=${(page - 1) * limit}`,
        { headers: await getAuthHeaders() }
      );
      const data = (await response.json()) as {
        transactions: WalletTransaction[];
        total?: number;
      };
      const transactions = data.transactions || [];
      await cacheTransactions(transactions, page);
      return {
        transactions,
        total: data.total || transactions.length,
        hasMore: transactions.length === limit,
      };
    } catch (error) {
      if (page === 1) {
        const cached = safeParse(
          (await AsyncStorage.getItem(STORAGE_KEYS.WALLET_TXN_CACHE)) || '[]'
        ) as WalletTransaction[] | undefined;
        if (cached && cached.length) {
          return { transactions: cached, total: cached.length, hasMore: false };
        }
      }
      throw error;
    }
  },

  async processCODPayment(orderId: string, amount: number): Promise<boolean> {
    if (!orderId || !Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid COD payment details');
    }
    const response = await fetchWithRetry(`${API_URL}/wallet/cod/process`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ orderId, amount }),
    });
    const result = (await response.json()) as { success?: boolean };
    await AsyncStorage.removeItem(STORAGE_KEYS.WALLET_CACHE);
    return Boolean(result?.success);
  },

  clearCache(): void {
    AsyncStorage.multiRemove([
      STORAGE_KEYS.WALLET_CACHE,
      STORAGE_KEYS.WALLET_TXN_CACHE,
    ]).catch(() => undefined);
  },
};

const walletCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

export function formatWalletAmount(amount: number, currency = 'INR'): string {
  try {
    return walletCurrencyFormatter.format(Number(amount) || 0);
  } catch {
    return `₹${Number(amount) || 0}`;
  }
}
