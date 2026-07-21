import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  try {
    const sessionToken = req.cookies.session_token || req.headers.authorization?.replace('Bearer ', '');
    const response = await fetch(`${BACKEND_URL}/api/customer/promo/validate?code=${encodeURIComponent(String(code || ''))}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      credentials: 'include',
    });
    const data = response.ok ? await response.json() : await response.text();
    res.status(response.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to reach backend' });
  }
}
