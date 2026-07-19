// SSR-safe date formatting.
//
// `Date.prototype.toLocaleString()` / `toLocaleDateString()` format using the
// server's locale and timezone during SSR but the browser's locale/timezone on
// the client. That produces different text on the server vs the client and
// triggers a React hydration mismatch.
//
// These helpers always pass an explicit `locale` and `timeZone` so the server
// and the browser render identical output. Defaults match the platform's
// primary market (India / IST).

export const DEFAULT_LOCALE = 'en-IN';
export const DEFAULT_TIME_ZONE = 'Asia/Kolkata';

export function formatDate(
  value: string | number | Date,
  options?: { locale?: string; timeZone?: string },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(options?.locale ?? DEFAULT_LOCALE, {
    timeZone: options?.timeZone ?? DEFAULT_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(
  value: string | number | Date,
  options?: { locale?: string; timeZone?: string },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(options?.locale ?? DEFAULT_LOCALE, {
    timeZone: options?.timeZone ?? DEFAULT_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(
  value: string | number | Date,
  options?: { locale?: string; timeZone?: string },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(options?.locale ?? DEFAULT_LOCALE, {
    timeZone: options?.timeZone ?? DEFAULT_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

// SSR-safe number formatting. Grouping separators differ by locale (e.g.
// "1,234" vs "1.234"), which also causes hydration mismatches if the server
// and browser resolve different default locales.
export function formatNumber(
  value: number,
  options?: { locale?: string; maximumFractionDigits?: number; minimumFractionDigits?: number },
): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return value.toLocaleString(options?.locale ?? DEFAULT_LOCALE, {
    maximumFractionDigits: options?.maximumFractionDigits,
    minimumFractionDigits: options?.minimumFractionDigits,
  });
}
