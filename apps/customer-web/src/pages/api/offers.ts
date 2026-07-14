import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  validTill: string;
  type: string;
  value: number;
  minOrder: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(`${BACKEND_URL}/loyalty/coupons`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Backend returned ${response.status}` });
    }

    const data = await response.json();
    const coupons: Coupon[] = Array.isArray(data) ? data : data.coupons || [];

    const formatted = coupons.map((coupon: Coupon) => ({
      id: coupon.id,
      title: coupon.title || 'Offer',
      description: coupon.description || '',
      code: coupon.code,
      validTill: coupon.validTill || '',
      type: coupon.type === 'percentage' ? 'percentage' : coupon.type === 'fixed' ? 'fixed' : 'bogo',
      value: coupon.value || 0,
      minOrder: coupon.minOrder || 0,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch offers from backend service' });
  }
}
