import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { restaurantId } = req.query || {};

  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId query parameter required' });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/business/restaurants/${restaurantId}/menu`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const menu = await response.json();
    // Transform menu items to categories format
    const categoriesMap = new Map<string, { id: string; name: string; items: any[] }>();
    menu.forEach((item: any) => {
      if (!categoriesMap.has(item.categoryName)) {
        categoriesMap.set(item.categoryName, {
          id: `${item.categoryId}`,
          name: item.categoryName,
          items: [],
        });
      }
      categoriesMap.get(item.categoryName)?.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
      });
    });

    res.status(200).json(Array.from(categoriesMap.values()));
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch menu categories from backend service' });
  }
}