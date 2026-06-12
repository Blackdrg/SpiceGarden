import type { NextApiRequest, NextApiResponse } from 'next';

const mockOrders = [
  {
    id: 'kds-a1',
    orderNumber: 'SG-A1B2C3',
    diner: 'Guest',
    table: 'T-05',
    serviceType: 'delivery',
    items: [
      { id: 'i1', name: 'Zinger Burger', qty: 1, modifiers: ['Extra Spicy'], note: 'Less onions' },
    ],
    createdAt: new Date(),
    status: 'new',
    estPrepMins: 14,
  },
  {
    id: 'kds-b2',
    orderNumber: 'SG-D4E5F6',
    diner: 'Guest',
    table: 'T-02',
    serviceType: 'takeaway',
    items: [
      { id: 'i2', name: 'Veg Pizza', qty: 1, modifiers: ['Extra Cheese'] },
    ],
    createdAt: new Date(Date.now() - 60000),
    status: 'accepted',
    estPrepMins: 12,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockOrders);
}