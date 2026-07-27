import React, { createContext, useState, useCallback, ReactNode } from 'react';

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
