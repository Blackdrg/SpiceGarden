import { useEffect } from 'react';
export type { AnalyticsEventType, AnalyticsEvent } from '@spicegarden/shared/analytics';

export const trackEvent = (event: { event: string; properties?: Record<string, unknown> }) => {
  if (typeof window === 'undefined') return;

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...event, timestamp: Date.now() }),
    keepalive: true,
  }).catch(() => {});
};

export const useAnalytics = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackEvent({ event: 'page_view', properties: { url: window.location.href } });
    }
  }, []);
};
