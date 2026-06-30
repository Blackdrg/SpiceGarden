import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { branchId } = req.query || {};

  try {
    const url = new URL(`${BACKEND_URL}/admin/dashboard`);
    if (branchId) url.searchParams.set('branchId', branchId as string);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    // Transform to super-admin format
    res.status(200).json({
      stats: {
        revenue: data.stats?.revenue || 0,
        orders: data.stats?.totalOrders || 0,
        driversOnline: data.stats?.onlineDrivers || 0,
        complaints: data.stats?.complaints || 0,
        refunds: data.stats?.refunds || 0,
        fraudAlerts: data.stats?.fraudAlerts || 0,
        activeBranches: data.stats?.activeRestaurants || 0,
        pendingWithdrawals: 0,
      },
      revenueData: data.revenueData || generateDefaultRevenueData(),
      branches: data.branches || [],
      tickets: [],
    });
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch stats from backend service' });
  }
}

function generateDefaultRevenueData() {
  return Array.from({ length: 24 }, (_, i) => ({
    t: `${String(i).padStart(2, '0')}:00`,
    orders: Math.floor(Math.random() * 20) + 5,
    revenue: Math.floor(Math.random() * 2000) + 500,
  }));
}