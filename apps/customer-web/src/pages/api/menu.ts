import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categoryName: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { restaurantId } = req.query;

  if (!restaurantId || typeof restaurantId !== 'string') {
    return res.status(400).json({ error: 'restaurantId query parameter required' });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/business/restaurants/${restaurantId}/menu`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Backend returned ${response.status}` });
    }

    const menu = await response.json();
    res.status(200).json(menu);
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch menu from backend service' });
  }
}
