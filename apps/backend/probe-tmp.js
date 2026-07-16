const http = require('http');
function get(path, opts = {}) {
  return new Promise((resolve) => {
    const o = Object.assign({ method: 'GET', host: 'localhost', port: 3001, path }, opts);
    const req = http.request(o, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message, body: '' }));
    if (opts.body) req.write(opts.body);
    req.end();
  });
}
(async () => {
  const r = await get('/health');
  console.log('HEALTH', r.status, r.body.slice(0, 200));
})();
