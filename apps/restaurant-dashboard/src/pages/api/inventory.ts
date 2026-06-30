import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { branchId, lowStock } = req.query || {};

  if (!branchId) {
    return res.status(400).json({ error: 'branchId query parameter required' });
  }

  try {
    let url: string;
    if (lowStock === 'true') {
      url = `${BACKEND_URL}/kitchen/inventory/low-stock/${branchId}`;
    } else {
      url = `${BACKEND_URL}/business/restaurants/${branchId}/menu`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    if (lowStock === 'true') {
      // Transform low-stock items to simple format
      const lowStockItems = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        inStock: item.quantity || 0,
        threshold: item.threshold || 10,
      }));
      res.status(200).json(lowStockItems);
    } else {
      // Transform menu to inventory format
      const inventory = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        inStock: item.quantity || 100,
        threshold: item.threshold || 10,
      }));
      res.status(200).json(inventory);
    }
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch inventory from backend service' });
  }
}