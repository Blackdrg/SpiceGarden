const DEFAULT_ALLOWED_ORIGINS = 'http://localhost:3002,http://localhost:3003,http://localhost:3004';

export function getAllowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(origin);
}
