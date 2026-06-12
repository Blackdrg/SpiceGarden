import type { NextApiRequest, NextApiResponse } from 'next';

const mockCategories = [
  { id: '1', name: 'Burgers', icon: '🍔', items: [] },
  { id: '2', name: 'Pizza', icon: '🍕', items: [] },
  { id: '3', name: 'Drinks', icon: '🥤', items: [] },
  { id: '4', name: 'Dessert', icon: '🍰', items: [] },
  { id: '5', name: 'Healthy', icon: '🥗', items: [] },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockCategories);
}