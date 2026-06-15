import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const SUPPORTED_LOCALES = ['en-IN', 'hi', 'pa', 'mr', 'gu', 'ta', 'te'] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en-IN',
  setLocale: function setLocale() {},
});

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en-IN');

  const setLocale = useCallback(function setLocale(newLocale: SupportedLocale) {
    setLocaleState(newLocale);
  }, []);

  return React.createElement(
    LocaleContext.Provider,
    { value: { locale: locale, setLocale: setLocale } },
    children
  );
};

export function useLocale() {
  return useContext(LocaleContext);
}

const INTL_OPTIONS = {
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const;

const NUMBER_FORMATTERS: Record<SupportedLocale, Intl.NumberFormat> = {
  'en-IN': new Intl.NumberFormat('en-IN', INTL_OPTIONS),
  hi: new Intl.NumberFormat('hi', INTL_OPTIONS),
  pa: new Intl.NumberFormat('pa', INTL_OPTIONS),
  mr: new Intl.NumberFormat('mr', INTL_OPTIONS),
  gu: new Intl.NumberFormat('gu', INTL_OPTIONS),
  ta: new Intl.NumberFormat('ta', INTL_OPTIONS),
  te: new Intl.NumberFormat('te', INTL_OPTIONS),
};

const DATE_FORMATTERS: Record<SupportedLocale, Intl.DateTimeFormat> = {
  'en-IN': new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  hi: new Intl.DateTimeFormat('hi', { day: 'numeric', month: 'short', year: 'numeric' }),
  pa: new Intl.DateTimeFormat('pa', { day: 'numeric', month: 'short', year: 'numeric' }),
  mr: new Intl.DateTimeFormat('mr', { day: 'numeric', month: 'short', year: 'numeric' }),
  gu: new Intl.DateTimeFormat('gu', { day: 'numeric', month: 'short', year: 'numeric' }),
  ta: new Intl.DateTimeFormat('ta', { day: 'numeric', month: 'short', year: 'numeric' }),
  te: new Intl.DateTimeFormat('te', { day: 'numeric', month: 'short', year: 'numeric' }),
};

const TIME_FORMATTERS: Record<SupportedLocale, Intl.DateTimeFormat> = {
  'en-IN': new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }),
  hi: new Intl.DateTimeFormat('hi', { hour: '2-digit', minute: '2-digit' }),
  pa: new Intl.DateTimeFormat('pa', { hour: '2-digit', minute: '2-digit' }),
  mr: new Intl.DateTimeFormat('mr', { hour: '2-digit', minute: '2-digit' }),
  gu: new Intl.DateTimeFormat('gu', { hour: '2-digit', minute: '2-digit' }),
  ta: new Intl.DateTimeFormat('ta', { hour: '2-digit', minute: '2-digit' }),
  te: new Intl.DateTimeFormat('te', { hour: '2-digit', minute: '2-digit' }),
};

function getFormatter(locale: SupportedLocale, type: 'number' | 'date' | 'time'): Intl.NumberFormat | Intl.DateTimeFormat {
  if (type === 'number') return NUMBER_FORMATTERS[locale];
  if (type === 'date') return DATE_FORMATTERS[locale];
  return TIME_FORMATTERS[locale];
}

export function formatLocalizedCurrency(amount: number, locale: SupportedLocale): string {
  const symbol = '₹';
  try {
    return (getFormatter(locale, 'number') as Intl.NumberFormat).format(amount);
  } catch {
    return symbol + Math.round(amount);
  }
}

export function formatLocalizedDate(date: string | Date, locale: SupportedLocale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  try {
    return (getFormatter(locale, 'date') as Intl.DateTimeFormat).format(dateObj);
  } catch {
    return dateObj.toLocaleDateString();
  }
}

export function formatLocalizedTime(time: string, locale: SupportedLocale): string {
  if (/^\d{2}:\d{2}$/.test(time)) {
    const parts = time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    try {
      const date = new Date();
      date.setHours(hours, minutes);
      return (getFormatter(locale, 'time') as Intl.DateTimeFormat).format(date);
    } catch {
      return time;
    }
  }
  return time;
}
