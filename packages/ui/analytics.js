"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebVitals = exports.useAnalytics = exports.trackEvent = void 0;
const react_1 = require("react");
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics';
const sendAnalyticsEvent = (event) => {
    if (typeof window === 'undefined')
        return;
    try {
        const blob = new Blob([JSON.stringify({ ...event, timestamp: Date.now() })], { type: 'application/json' });
        navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    }
    catch {
        // silently ignore
    }
};
const trackEvent = (event) => {
    sendAnalyticsEvent(event);
};
exports.trackEvent = trackEvent;
function trackPageView(url) {
    if (typeof window === 'undefined')
        return;
    sendAnalyticsEvent({
        event: 'page_view',
        properties: { url },
    });
}
const useAnalytics = () => {
    (0, react_1.useEffect)(() => {
        if (typeof window === 'undefined')
            return;
        trackPageView(window.location.href);
    }, []);
};
exports.useAnalytics = useAnalytics;
function setupWebVitals() {
    if (typeof window === 'undefined' || !('performance' in window))
        return () => { };
    const reportVital = (metric) => {
        sendAnalyticsEvent({
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
    let timeoutId;
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    timeoutId = setTimeout(() => {
        const cls = window.cumulativeLayoutShift || 0;
        reportVital({ name: 'CLS', value: cls });
    }, 5000);
    return () => {
        observer.disconnect();
        if (timeoutId !== undefined)
            clearTimeout(timeoutId);
    };
}
const useWebVitals = () => {
    (0, react_1.useEffect)(() => {
        return setupWebVitals();
    }, []);
    return null;
};
exports.useWebVitals = useWebVitals;
