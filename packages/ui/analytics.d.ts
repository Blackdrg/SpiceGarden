type EventType = 'page_view' | 'click' | 'order_placed' | 'payment_success' | 'payment_failed' | 'search' | 'add_to_cart' | 'web_vital' | 'flow_started' | 'flow_step_completed' | 'flow_completed' | 'flow_error' | 'navigation_change';
interface AnalyticsEvent {
    event: EventType;
    properties?: Record<string, unknown>;
}
export declare const trackEvent: (event: AnalyticsEvent) => void;
export declare const useAnalytics: () => void;
export declare const useWebVitals: () => null;
export {};
