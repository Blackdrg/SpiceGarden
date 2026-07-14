import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
      },
      body: JSON.stringify(req.body),
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({ error: 'Failed to connect to authentication service' });
  }
}
