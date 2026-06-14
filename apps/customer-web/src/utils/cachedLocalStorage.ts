let cachedToken: string | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5_000;

export function getCachedToken(): string | null {
  const now = Date.now();
  if (cachedToken && now - cachedAt < CACHE_TTL_MS) return cachedToken;
  cachedToken = localStorage.getItem('sg_token:v1');
  cachedAt = now;
  return cachedToken;
}

export function clearCachedToken(): void {
  cachedToken = null;
  cachedAt = 0;
  localStorage.removeItem('sg_token:v1');
}
