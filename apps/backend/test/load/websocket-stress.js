import ws from 'k6/ws';
import { check, group, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';
import { BASE_URL, WS_URL, loadOptions, metrics, request, setup } from './common.js';

const wsConnectionSuccess = new Rate('ws_connection_success');
const wsMessageSuccess = new Rate('ws_message_success');
const wsErrors = new Counter('ws_errors_total');

export const options = loadOptions([
  { duration: '1m', target: 50 },
  { duration: '3m', target: 50 },
  { duration: '1m', target: 0 },
]);

export { setup };

export default function() {
  group('Websocket stress - tracking', () => {
    const res = ws.connect(`${WS_URL}/tracking`, { tags: { step: 'ws-tracking' } }, (socket) => {
      socket.on('open', () => {
        wsConnectionSuccess.add(true);
        socket.send(JSON.stringify({ event: 'ping' }));
      });
      socket.on('message', (data) => {
        try {
          const msg = JSON.parse(data);
          wsMessageSuccess.add(msg.status === 'pong' || msg.status === 'ok' || msg.event === 'pong');
        } catch (e) {
          wsMessageSuccess.add(false);
        }
      });
      socket.on('error', (error) => {
        wsMessageSuccess.add(false);
        wsErrors.add(1);
        console.log(JSON.stringify({ level: 'error', step: 'websocket', exception: String(error) }));
      });
      socket.setTimeout(() => {
        socket.close();
      }, 3000);
    });
    check(res, { 'websocket status 101': (r) => r && r.status === 101 });
  });
  group('Websocket stress - backend health', () => {
    request('GET', `${BASE_URL}/health`, null, { tags: { step: 'ws-health' } }, 'websocket backend health', [200], metrics.browseSuccess);
  });
  sleep(Number(__ENV.THINK_TIME_SECONDS || 2));
}
