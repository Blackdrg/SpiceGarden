import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function proxyRequest(req: NextApiRequest, res: NextApiResponse, backendPath: string) {
  try {
    const sessionToken = req.cookies.session_token || req.headers.authorization?.replace('Bearer ', '');

    const response = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      credentials: 'include',
    });

    const data = response.ok ? await response.json() : await response.text();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reach backend' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug, ...rest } = req.query;
  const path = Array.isArray(slug) ? `/${slug.join('/')}` : `/${slug || ''}`;
  proxyRequest(req, res, path);
}
