const fs = require('fs');
const spec = require('./openapi.json');
const BASE = 'http://localhost:3001';
// Endpoints documented in OpenAPI but NOT reachable at runtime (404 on GET, or all methods 404)
// We already probed: build a runtime map from probe-results.json + probe-auth-results.json
const un = JSON.parse(fs.readFileSync('./probe-results.json'));
const au = JSON.parse(fs.readFileSync('./probe-auth-results.json'));
function norm(p){ return p.replace(/\/[^/]+/g, seg => /^\/(\[?[0-9a-fA-F-]{1,64}\]?|\{[^}]+\})$/.test(seg) ? '/{id}' : seg).replace(/{[^}]+}/g,'{id}'); }
const runtime = {}; // path -> best status
for (const r of un.results) { const k=norm(r.path); runtime[k]=Math.min(runtime[k]??999, statusNum(r.status)); }
for (const r of au.results) { const k=norm(r.path); runtime[k]=Math.min(runtime[k]??999, statusNum(r.status)); }
function statusNum(s){ if(s===200)return 200; if(s===201)return 201; if(s===400)return 400; if(s===401)return 401; if(s===403)return 403; if(s===404)return 404; if(s===500)return 500; if(s===409)return 409; if(s===429)return 429; return 999; }
// Documented paths
const documented = new Set();
for (const p of Object.keys(spec.paths)) documented.add(norm(p));
// Runtime reachable paths (any status except persistent 404)
const runtimeReachable = new Set(Object.keys(runtime).filter(k => runtime[k] !== 404));
// Drift: documented but never reachable (all 404 in both probes)
const docButDead = [...documented].filter(k => runtime[k] === 404);
// Undocumented but reachable (orphan routes not in OpenAPI)
const undocButLive = [...runtimeReachable].filter(k => !documented.has(k));
console.log('=== OPENAPI CONSISTENCY (Section 13) ===');
console.log('Documented paths:', documented.size);
console.log('Documented-but-DEAD (404 in runtime):', docButDead.length);
docButDead.forEach(d=>console.log('  DEAD:', d));
console.log('Live-but-UNDOCUMENTED (orphan routes):', undocButLive.length);
undocButLive.slice(0,30).forEach(d=>console.log('  ORPHAN:', d));
// DTO/response drift: count documented POST/PUT with requestBody
let withBody=0, withoutBody=0;
for (const [p,ops] of Object.entries(spec.paths)){
  for (const [m,op] of Object.entries(ops)){
    if(['post','put','patch'].includes(m.toLowerCase())){
      if(op.requestBody) withBody++; else withoutBody++;
    }
  }
}
console.log('Documented write-ops WITH requestBody schema:', withBody, ' WITHOUT:', withoutBody);
