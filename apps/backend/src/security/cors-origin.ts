const DEFAULT_ALLOWED_ORIGINS = 'http://localhost:3002,http://localhost:3003,http://localhost:3004';

function normalizeOrigin(origin: string): string | null {
  const trimmed = origin.trim();
  if (!trimmed || trimmed === '*' || trimmed.includes('*')) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    url.hash = '';
    url.search = '';
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(): string[] {
  const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || (
    process.env.NODE_ENV === 'production' ? '' : DEFAULT_ALLOWED_ORIGINS
  );

  return rawOrigins
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean) as string[];
}

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) {
    return false;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  return getAllowedOrigins().includes(normalizedOrigin);
}
