import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type SupportedLocale = 'en-IN' | 'hi' | 'pa' | 'mr' | 'gu' | 'ta' | 'te';

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

const formatterMap = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function getFormatter(locale: string, type: 'number' | 'date' | 'time'): Intl.NumberFormat | Intl.DateTimeFormat {
  const key = `${type}:${locale}`;
  let formatter = formatterMap.get(key);
  if (!formatter) {
    if (type === 'number') {
      formatter = new Intl.NumberFormat(locale, INTL_OPTIONS);
    } else if (type === 'date') {
      formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    } else {
      formatter = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
    }
    formatterMap.set(key, formatter);
  }
  return formatter;
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
