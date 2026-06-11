export type AnalyticsEventType = 
  | 'page_view' 
  | 'click' 
  | 'order_placed' 
  | 'payment_success' 
  | 'payment_failed' 
  | 'search' 
  | 'add_to_cart' 
  | 'web_vital'
  | 'flow_started'
  | 'flow_step_completed'
  | 'flow_completed'
  | 'flow_error'
  | 'navigation_change'
  | 'api_request_success'
  | 'api_request_queued'
  | 'offline_action_synced';

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  properties?: Record<string, unknown>;
}
