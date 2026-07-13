import { useEffect } from 'react';
export type { AnalyticsEventType, AnalyticsEvent } from '@spicegarden/shared/analytics';

const trackEvent = (event: { event: string; properties?: Record<string, unknown> }) => {
  if (typeof window === 'undefined') return;

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
