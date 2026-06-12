import type { NextApiRequest, NextApiResponse } from 'next';

const mockInventory = [
  { id: 'inv-1', name: 'Burger Buns', inStock: 12, threshold: 20 },
  { id: 'inv-2', name: 'Cheese Slices', inStock: 25, threshold: 50 },
  { id: 'inv-3', name: 'Tomatoes', inStock: 8, threshold: 15 },
  { id: 'inv-4', name: 'Chicken Patties', inStock: 3, threshold: 25 },
  { id: 'inv-5', name: 'Lettuce', inStock: 2, threshold: 10 },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockInventory);
}