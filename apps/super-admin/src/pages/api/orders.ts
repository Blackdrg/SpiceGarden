import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '10', status } = req.query || {};

  try {
    const url = new URL(`${BACKEND_URL}/admin/orders`);
    url.searchParams.set('page', page as string);
    url.searchParams.set('limit', limit as string);
    if (status) url.searchParams.set('status', status as string);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const orders = await response.json();
    // Transform to super-admin format
    const transformedOrders = orders.map((order: any) => ({
      id: order.id,
      amount: order.grandTotal || 0,
      branch: order.branch?.branchName || order.restaurant?.name || 'Unknown',
      eta: order.estimatedTimeMinutes || 30,
      status: mapOrderStatus(order.status),
      timestamp: order.createdAt || Date.now(),
    }));

    res.status(200).json(transformedOrders);
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch orders from backend service' });
  }
}

function mapOrderStatus(status: string): string {
  const map: Record<string, string> = {
    PLACED: 'placed',
    RESTAURANT_ACCEPTED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DRIVER_ASSIGNED: 'assigned',
    ON_THE_WAY: 'on_the_way',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  return map[status] || status.toLowerCase();
}