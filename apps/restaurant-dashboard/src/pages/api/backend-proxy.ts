import type { NextApiRequest } from 'next';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getBackendUrl(): string {
  return BACKEND_URL;
}

/**
 * Builds the headers forwarded to the backend, carrying the caller's session
 * (httpOnly cookie or Bearer token) so authenticated backend endpoints work
 * through the Next.js API proxy layer.
 */
export function backendHeaders(req: NextApiRequest, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };

  const reqHeaders = req.headers || {};
  if (reqHeaders.cookie) {
    headers['Cookie'] = reqHeaders.cookie;
  }

  const authHeader = reqHeaders.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    headers['Authorization'] = authHeader;
  } else {
    const sessionToken = req.cookies?.session_token;
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
  }

  return headers;
}

export function backendFetchOptions(
  req: NextApiRequest,
  extra: Record<string, string> = {},
): RequestInit {
  return {
    method: req.method,
    headers: backendHeaders(req, extra),
    credentials: 'include',
    body:
      req.method !== 'GET' && req.method !== 'HEAD' && req.body
        ? JSON.stringify(req.body)
        : undefined,
  };
}
