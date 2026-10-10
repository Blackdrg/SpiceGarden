import { useEffect } from 'react';
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics';
const eventQueue = [];
let isFlushing = false;
const flushQueue = () => {
    if (typeof window === 'undefined' || eventQueue.length === 0 || isFlushing)
        return;
    isFlushing = true;
    const events = eventQueue.splice(0);
    for (const event of events) {
        const payload = JSON.stringify({ ...event, timestamp: Date.now() });
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
        }
        else {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', ANALYTICS_ENDPOINT, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(payload);
            }
            catch {
                // ignore
            }
        }
    }
    isFlushing = false;
};
export const trackEvent = (event) => {
    if (typeof window === 'undefined')
        return;
    eventQueue.push(event);
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(flushQueue);
    }
    else {
        setTimeout(flushQueue, 0);
    }
};
export const useAnalytics = () => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            trackEvent({ event: 'page_view', properties: { url: window.location.href } });
        }
    }, []);
};
export const useWebVitals = () => {
    useEffect(() => {
        if (typeof window === 'undefined' || !('performance' in window))
            return;
        const reportVital = (metric) => {
            trackEvent({
                event: 'web_vital',
                properties: {
                    metric: metric.name,
                    value: metric.value,
                    path: window.location.pathname,
                },
            });
        };
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'largest-contentful-paint') {
                    reportVital({ name: 'LCP', value: entry.startTime });
                }
                if (entry.entryType === 'first-input') {
                    const firstInput = entry;
                    const inputDelay = firstInput.processingStart - firstInput.startTime;
                    reportVital({ name: 'FID', value: inputDelay });
                }
            });
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        const timerId = setTimeout(() => {
            const cls = window.cumulativeLayoutShift || 0;
            reportVital({ name: 'CLS', value: cls });
        }, 5000);
        return () => {
            clearTimeout(timerId);
            observer.disconnect();
        };
    }, []);
    return null;
};
