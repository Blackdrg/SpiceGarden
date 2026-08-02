import { useEffect } from 'react';
export type { AnalyticsEventType, AnalyticsEvent } from '@spicegarden/shared/analytics';

const CONSENT_STORAGE_KEY = 'sg_cookie_consent'

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return typeof parsed?.prefs?.analytics === 'boolean' ? parsed.prefs.analytics : false
  } catch {
    return false
  }
}

const trackEvent = (event: { event: string; properties?: Record<string, unknown> }) => {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return;

  const body = JSON.stringify({ ...event, timestamp: Date.now() });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
  }
};

export const useAnalytics = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackEvent({ event: 'page_view', properties: { url: window.location.href } });
    }
  }, []);
};
