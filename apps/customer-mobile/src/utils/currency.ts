const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const NUMBER_FORMATTERS: Record<string, Intl.NumberFormat> = {
  'en-IN': new Intl.NumberFormat('en-IN'),
  hi: new Intl.NumberFormat('hi'),
  pa: new Intl.NumberFormat('pa'),
  mr: new Intl.NumberFormat('mr'),
  gu: new Intl.NumberFormat('gu'),
  ta: new Intl.NumberFormat('ta'),
  te: new Intl.NumberFormat('te'),
};

function getNumberFormatter(locale: string): Intl.NumberFormat {
  return NUMBER_FORMATTERS[locale] || defaultNumberFormatter;
}

const defaultNumberFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number, currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

function formatNumber(value: number, locale?: string): string {
  if (!locale) return defaultNumberFormatter.format(value);
  return getNumberFormatter(locale).format(value);
}

export function formatDate(date: string | Date, locale?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: string | Date, locale?: string): string {
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
