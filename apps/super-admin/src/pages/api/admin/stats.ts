import type { NextApiRequest, NextApiResponse } from 'next';

const mockStats = {
  stats: {
    revenue: 45200,
    orders: 124,
    driversOnline: 18,
    complaints: 3,
    refunds: 12,
    fraudAlerts: 3,
    activeBranches: 3,
    pendingWithdrawals: 8,
  },
  revenueData: [
    { t: '00:00', orders: 10, revenue: 1200 },
    { t: '04:00', orders: 15, revenue: 1800 },
    { t: '08:00', orders: 20, revenue: 2400 },
    { t: '12:00', orders: 25, revenue: 3000 },
    { t: '16:00', orders: 30, revenue: 3600 },
    { t: '20:00', orders: 22, revenue: 2640 },
    { t: '23:59', orders: 18, revenue: 2160 },
  ],
  branches: [
    {
      name: 'Sector 17 Kitchen',
      status: 'operational',
      orderCount: 45,
      avgPrepMins: 15,
      driversAssigned: 12,
    },
    {
      name: 'Sector 22 Kitchen',
      status: 'operational',
      orderCount: 38,
      avgPrepMins: 18,
      driversAssigned: 8,
    },
    {
      name: 'Sector 35 Kitchen',
      status: 'delayed',
      orderCount: 52,
      avgPrepMins: 28,
      driversAssigned: 5,
    },
  ],
  tickets: [
    {
      id: 'TICK-001',
      type: 'refund',
      user: 'John D.',
      amount: 450,
      severity: 'high',
      description: 'Order not delivered - driver marked delivered without delivery',
      createdAt: '2026-06-12 10:23 AM',
    },
    {
      id: 'TICK-002',
      type: 'support',
      user: 'Priya K.',
      severity: 'medium',
      description: 'App crash on restaurant page',
      createdAt: '2026-06-12 09:45 AM',
    },
    {
      id: 'TICK-003',
      type: 'fraud',
      user: 'Unknown',
      amount: 299,
      severity: 'critical',
      description: 'Multiple failed payment attempts with different cards',
      createdAt: '2026-06-12 11:12 AM',
    },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockStats);
}