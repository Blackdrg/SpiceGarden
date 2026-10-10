import { useEffect } from 'react';
export type { AnalyticsEventType, AnalyticsEvent } from '@spicegarden/shared/analytics';

const trackEvent = (event: { event: string; properties?: Record<string, unknown> }) => {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({ ...event, timestamp: Date.now() });
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics', blob);
    return;
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/analytics', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(payload);
  } catch {
    // ignore
  }
};

export const useAnalytics = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackEvent({ event: 'page_view', properties: { url: window.location.href } });
    }
  }, []);
};
