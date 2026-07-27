declare const process: { env: Record<string, string | undefined> }

import { useEffect } from 'react'

type EventType = 'page_view' | 'click' | 'order_placed' | 'payment_success' | 'payment_failed' | 'search' | 'add_to_cart' | 'web_vital' | 'flow_started' | 'flow_step_completed' | 'flow_completed' | 'flow_error' | 'navigation_change'

interface AnalyticsEvent {
  event: EventType
  properties?: Record<string, unknown>
}

const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics'

export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return

  fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...event, timestamp: Date.now() }),
    keepalive: true,
  }).catch(() => {})
}

function trackPageView(url: string) {
  if (typeof window === 'undefined') return;
  trackEvent({
    event: 'page_view',
    properties: { url },
  });
}

export const useAnalytics = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    trackPageView(window.location.href);
  }, [])
}

function setupWebVitals(): () => void {
  if (typeof window === 'undefined' || !('performance' in window)) return () => {};

  const reportVital = (metric: { name: string; value: number }) => {
    trackEvent({
      event: 'web_vital',
      properties: {
        metric: metric.name,
        value: metric.value,
        path: window.location.pathname,
      },
    })
  }

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        reportVital({ name: 'LCP', value: entry.startTime })
      }
      if (entry.entryType === 'first-input') {
        const firstInput = entry as PerformanceEventTiming
        const inputDelay = firstInput.processingStart - firstInput.startTime
        reportVital({ name: 'FID', value: inputDelay })
      }
    })
  })

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })

  timeoutId = setTimeout(() => {
    const cls = (window as any).cumulativeLayoutShift || 0
    reportVital({ name: 'CLS', value: cls })
  }, 5000)

  return () => {
    observer.disconnect()
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

export const useWebVitals = () => {
  useEffect(() => {
    return setupWebVitals();
  }, [])

  return null
}