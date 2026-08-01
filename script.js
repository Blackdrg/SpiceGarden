import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  cloud: {
    // Project: Default project
    projectID: 8057323,
    // Test runs with the same name groups test runs together.
    name: 'Test (10/07/2026-19:28:44)'
  }
};

export default function() {
  http.get('https://quickpizza.grafana.com');
  sleep(1);
}