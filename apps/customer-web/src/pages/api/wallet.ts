import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface WalletBalance {
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const balanceRes = await fetch(`${BACKEND_URL}/wallet/balance`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!balanceRes.ok) {
      return res.status(balanceRes.status).json({ error: `Backend returned ${balanceRes.status}` });
    }

    const balanceData = await balanceRes.json();

    const txRes = await fetch(`${BACKEND_URL}/wallet/transactions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const transactions = txRes.ok ? await txRes.json() : [];

    res.status(200).json({
      balance: balanceData.balance || balanceData.availableBalance || 0,
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type === 'credit' || tx.type === 'debit' ? tx.type : 'credit',
        amount: tx.amount,
        description: tx.description || tx.narration || 'Transaction',
        date: tx.createdAt || tx.date,
      })),
    });
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch wallet data from backend service' });
  }
}
