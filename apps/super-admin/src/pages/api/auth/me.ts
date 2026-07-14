import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Not authenticated' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: 'Failed to connect to authentication service' });
  }
}
