const http = require('http');
const fs = require('fs');
const j = require('./openapi.json');
const paths = j.paths;

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const o = {
      method, host: 'localhost', port: 3001, path,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    };
    if (token) o.headers['Authorization'] = 'Bearer ' + token;
    if (data) o.headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request(o, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    });
    r.on('error', (e) => resolve({ status: 0, error: e.message, body: '' }));
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  const rows = [];
  const allPaths = Object.keys(paths);
  for (const p of allPaths) {
    const methods = Object.keys(paths[p]).filter(m => !['parameters','servers'].includes(m));
    for (const m of methods) {
      const r = await req(m.toUpperCase(), p, sampleBody(paths[p][m]));
      rows.push({ method: m.toUpperCase(), path: p, status: r.status, len: r.body.length, err: r.error || '' });
    }
  }
  fs.writeFileSync('probe-results.json', JSON.stringify(rows, null, 2));
  const counts = {};
  rows.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
  console.log('TOTAL', rows.length);
  console.log('BY_STATUS', JSON.stringify(counts));
}

function sampleBody(op) {
  if (!op || !op.requestBody) return null;
  const rb = op.requestBody;
  const ct = rb.content && rb.content['application/json'];
  if (!ct || !ct.schema) return {};
  return synthesize(ct.schema);
}
function synthesize(schema) {
  if (!schema) return {};
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.type === 'object') {
    const out = {};
    Object.keys(schema.properties || {}).forEach(k => { out[k] = synthesize(schema.properties[k]); });
    return out;
  }
  if (schema.type === 'string') return schema.enum ? schema.enum[0] : 'test';
  if (schema.type === 'number' || schema.type === 'integer') return 1;
  if (schema.type === 'boolean') return true;
  if (schema.type === 'array') return [];
  return 'x';
}
main();
