const http = require('http');
const endpoints = [
  { path: '/', method: 'GET' },
  { path: '/health', method: 'GET' },
  { path: '/metrics', method: 'GET' },
  { path: '/auth/login', method: 'POST', body: { email: 'test@example.com', password: 'test123' } },
  { path: '/restaurants', method: 'GET' },
  { path: '/restaurants/search?q=pizza', method: 'GET' },
  { path: '/orders/health', method: 'GET' },
  { path: '/payments/gateways', method: 'GET' },
];

let delay = 0;
endpoints.forEach((ep) => {
  setTimeout(() => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: ep.path,
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`\n${ep.method} ${ep.path} -> ${res.statusCode}`);
        console.log(data.substring(0, 200));
      });
    });

    req.on('error', (e) => console.error(`Error ${ep.path}: ${e.message}`));
    if (ep.body) req.write(JSON.stringify(ep.body));
    req.end();
  }, delay);
  delay += 2000;
});
