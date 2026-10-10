// infra/load-tests/500k/helpers/metrics.js
import { Trend, Rate, Counter, Gauge } from 'k6/metrics';

// Scenario Duration Trends
export const browseDuration = new Trend('scenario_browse_duration', true);
export const searchDuration = new Trend('scenario_search_duration', true);
export const cartDuration = new Trend('scenario_cart_duration', true);
export const checkoutDuration = new Trend('scenario_checkout_duration', true);
export const adminDuration = new Trend('scenario_admin_duration', true);

// Success Rates
export const browseSuccessRate = new Rate('browse_success_rate');
export const searchSuccessRate = new Rate('search_success_rate');
export const cartSuccessRate = new Rate('cart_success_rate');
export const checkoutSuccessRate = new Rate('checkout_success_rate');
export const adminSuccessRate = new Rate('admin_success_rate');

// WebSocket Metrics
export const wsConnectingDuration = new Trend('ws_connecting_duration', true);
export const wsSessionDuration = new Trend('ws_session_duration', true);
export const wsMessagesReceived = new Counter('ws_messages_received_total');
export const wsMessagesSent = new Counter('ws_messages_sent_total');
export const wsErrorsTotal = new Counter('ws_errors_total');
export const wsConnectionsActive = new Gauge('ws_connections_active');
export const wsConnectionSuccessRate = new Rate('ws_connection_success_rate');

// Business & Throughput Metrics
export const ordersPlacedTotal = new Counter('orders_placed_total');
export const paymentIntentsTotal = new Counter('payment_intents_total');
export const catalogViewsTotal = new Counter('catalog_views_total');
export const searchQueriesTotal = new Counter('search_queries_total');
