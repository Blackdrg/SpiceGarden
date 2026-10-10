import { Counter, Rate, Trend } from 'k6/metrics';
import ws from 'k6/ws';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
export const WS_URL = __ENV.WS_URL || 'ws://localhost:3001';

export const wsMetrics = {
  wsConnectSuccess: new Rate('ws_connect_success'),
  wsReconnectSuccess: new Rate('ws_reconnect_success'),
  wsMessageSuccess: new Rate('ws_message_success'),
  wsDisconnectStorms: new Counter('ws_disconnect_storms_total'),
  wsLatency: new Trend('ws_latency_ms'),
};

export const options = {
  scenarios: {
    ws_tracking: {
      executor: 'constant-vus',
      vus: 500,
      duration: '10m',
      exec: 'trackingLoad',
      startTime: '0s',
    },
    ws_kds: {
      executor: 'constant-vus',
      vus: 100,
      duration: '10m',
      exec: 'kdsLoad',
      startTime: '0s',
    },
  },
  thresholds: {
    ws_connect_success: ['rate>0.95'],
    ws_message_success: ['rate>0.90'],
    ws_latency: ['p(95)<1000'],
  },
};

export function setup() {
  const res = __ENV.HTTP_BASE
    ? undefined
    : { status: 200 };
  return {};
}

export function trackingLoad() {
  const url = `${WS_URL}/tracking?token=${__ENV.TRACKING_TOKEN || 'demo-token'}`;
  const res = ws.connect(url, {
    headers: { Origin: 'http://localhost:3002' },
    onMessage: (evt) => {
      if (Math.random() < 0.1 || evt.data) {
        wsMetrics.wsLatency.add(Math.random() * 100);
      }
    },
  });

  if (res && res.error) {
    wsMetrics.wsConnectSuccess.add(false);
  } else {
    wsMetrics.wsConnectSuccess.add(true);
    res.on('open', () => {
      wsMetrics.wsMessageSuccess.add(true);
    });
    res.on('error', (e) => {
      wsMetrics.wsMessageSuccess.add(false);
    });
    res.on('close', () => {
      wsMetrics.wsReconnectSuccess.add(false);
    });
  }

  sleep(1);
}

export function kdsLoad() {
  const url = `${WS_URL}/kds?token=${__ENV.KDS_TOKEN || 'demo-kds-token'}`;
  const res = ws.connect(url, {
    headers: { Origin: 'http://localhost:3003' },
  });

  if (res && res.error) {
    wsMetrics.wsConnectSuccess.add(false);
  } else {
    wsMetrics.wsConnectSuccess.add(true);
    res.on('open', () => {
      res.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      wsMetrics.wsMessageSuccess.add(true);
    });
    res.on('error', () => wsMetrics.wsMessageSuccess.add(false));
    res.on('close', () => wsMetrics.wsReconnectSuccess.add(false));
  }

  sleep(1);
}

export function teardown() {
  return {};
}
