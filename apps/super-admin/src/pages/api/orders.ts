import type { NextApiRequest, NextApiResponse } from 'next';

const mockOrders = [
  {
    id: 'ORD-001',
    amount: 450,
    branch: 'Sector 17 Branch',
    eta: 25,
    status: 'confirmed',
    timestamp: Date.now() - 300000,
  },
  {
    id: 'ORD-002',
    amount: 280,
    branch: 'Sector 22 Branch',
    eta: 35,
    status: 'preparing',
    timestamp: Date.now() - 180000,
  },
  {
    id: 'ORD-003',
    amount: 620,
    branch: 'Sector 17 Branch',
    eta: 15,
    status: 'ready',
    timestamp: Date.now() - 600000,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockOrders);
}