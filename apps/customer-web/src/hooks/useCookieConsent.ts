import { useState, useEffect, useCallback } from 'react';
import { legalApi, ConsentRecord } from '@spicegarden/shared/api';

export const CONSENT_STORAGE_KEY = 'sg_cookie_consent';
export const CONSENT_VERSION = '1.0.0';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  performance: boolean;
  functional: boolean;
  preference: boolean;
}

export const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  performance: false,
  functional: false,
  preference: false,
};

export function getStoredConsent(): { token: string; prefs: ConsentPreferences } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function detectRegion(): string {
  if (typeof navigator === 'undefined') return 'other';
  const lang = navigator.language?.toLowerCase() || '';
  if (lang.startsWith('en-in') || lang.startsWith('hi') || lang.includes('in')) return 'in';
  const eu = ['de', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ie', 'be', 'at', 'se', 'fi', 'dk', 'gr'];
  if (eu.some((c) => lang.startsWith(c))) return 'eu';
  return 'other';
}

export function useCookieConsent() {
  const [prefs, setPrefs] = useState<ConsentPreferences | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [region, setRegion] = useState('other');

  useEffect(() => {
    const stored = getStoredConsent();
    const detected = detectRegion();
    setRegion(detected);
    if (stored) {
      setPrefs(stored.prefs);
      setToken(stored.token);
      setBannerVisible(false);
    } else {
      setPrefs(DEFAULT_CONSENT);
      setBannerVisible(detected === 'eu' || detected === 'in');
    }
  }, []);

  const persist = useCallback((t: string, p: ConsentPreferences) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ token: t, prefs: p }));
    setToken(t);
    setPrefs(p);
  }, []);

  const saveConsent = useCallback(
    async (p: ConsentPreferences, userId?: string) => {
      const consentToken = token || crypto.randomUUID();
      const region = detectRegion();
      const res = await legalApi.recordConsent({
        userId,
        anonymousToken: userId ? undefined : consentToken,
        region,
        consentVersion: CONSENT_VERSION,
        ...p,
      });
      persist(res.data.consentId || consentToken, p);
      setBannerVisible(false);
      return res.data;
    },
    [token, persist],
  );

  const withdraw = useCallback(async () => {
    const stored = getStoredConsent();
    if (stored?.token) {
      const active = await legalApi.activeConsent(stored.token).catch(() => null);
      const consentId = (active?.data as ConsentRecord)?.id;
      if (consentId) {
        await legalApi.withdrawConsent(consentId).catch(() => null);
      }
    }
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    setPrefs(DEFAULT_CONSENT);
    setToken(null);
    setBannerVisible(true);
  }, []);

  return {
    prefs,
    token,
    bannerVisible,
    region,
    setBannerVisible,
    saveConsent,
    withdraw,
  };
}
