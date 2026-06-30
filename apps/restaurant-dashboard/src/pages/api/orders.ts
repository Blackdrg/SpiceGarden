import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { status, branchId } = req.query || {};

  try {
    const url = new URL(`${BACKEND_URL}/orders`);
    if (status) url.searchParams.set('status', status as string);
    if (branchId) url.searchParams.set('branchId', branchId as string);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const orders = await response.json();
    // Transform to KDS format
    const kdsOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber || order.id,
      diner: order.customerName || 'Guest',
      table: order.table || 'T-05',
      serviceType: order.serviceType || 'delivery',
      items: order.items || [],
      createdAt: order.createdAt || new Date(),
      status: mapOrderStatusToKDS(order.status),
      estPrepMins: order.estPrepMins || 15,
    }));

    res.status(200).json(kdsOrders);
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch orders from backend service' });
  }
}

function mapOrderStatusToKDS(status: string): string {
  const map: Record<string, string> = {
    PLACED: 'new',
    RESTAURANT_ACCEPTED: 'accepted',
    PREPARING: 'preparing',
    READY: 'ready',
    READY_FOR_PICKUP: 'ready',
    DRIVER_ASSIGNED: 'ready',
    PICKED_UP: 'pickedUp',
    ON_THE_WAY: 'onTheWay',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  return map[status] || 'new';
}