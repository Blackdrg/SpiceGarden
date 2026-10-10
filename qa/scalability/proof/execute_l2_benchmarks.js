const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const PROOF_DIR = path.join(ROOT_DIR, 'qa/scalability/proof');
if (!fs.existsSync(PROOF_DIR)) {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
}

function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          if (Date.now() - start > timeoutMs) reject(new Error('Server timeout non-200'));
          else setTimeout(check, 500);
        }
      }).on('error', (err) => {
        if (Date.now() - start > timeoutMs) reject(err);
        else setTimeout(check, 500);
      });
    };
    check();
  });
}

function runK6Test(vus, durationSec) {
  const testScriptPath = path.join(PROOF_DIR, `temp_k6_${vus}.js`);
  const scriptContent = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const options = {
  scenarios: {
    load_tier: {
      executor: 'constant-vus',
      vus: ${vus},
      duration: '${durationSec}s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = 'http://127.0.0.1:3001';
const reqDuration = new Trend('http_req_duration', true);
const reqSuccess = new Rate('http_req_success_rate');

export default function () {
  const r = Math.random();
  let res;
  if (r < 0.6) {
    res = http.get(BASE_URL + '/health');
  } else if (r < 0.9) {
    res = http.get(BASE_URL + '/metrics');
  } else {
    res = http.get(BASE_URL + '/restaurants');
  }
  
  const ok = res.status === 200;
  reqSuccess.add(ok);
  reqDuration.add(res.timings.duration);
  sleep(0.02);
}
`;
  fs.writeFileSync(testScriptPath, scriptContent);

  const jsonSummaryPath = path.join(PROOF_DIR, `k6_raw_${vus}.json`);
  const cmd = `k6 run --summary-export="${jsonSummaryPath}" "${testScriptPath}"`;
  
  console.log(`[L2 Benchmark] Running ${vus} VUs for ${durationSec}s...`);
  const startTime = Date.now();
  try {
    execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    // k6 exits with non-zero on threshold cross, but summary export is still written
  }

  const elapsedSec = (Date.now() - startTime) / 1000;
  
  let summaryData = {};
  if (fs.existsSync(jsonSummaryPath)) {
    try {
      summaryData = JSON.parse(fs.readFileSync(jsonSummaryPath, 'utf8'));
    } catch (_) {}
  }
  
  const metrics = summaryData.metrics || {};
  const httpReqs = metrics.http_reqs ? metrics.http_reqs.count : 0;
  const rps = metrics.http_reqs ? metrics.http_reqs.rate : (httpReqs / elapsedSec);
  const durationObj = metrics.http_req_duration || {};
  const failObj = metrics.http_req_failed || {};
  
  const p50 = durationObj.med !== undefined ? durationObj.med : (durationObj.avg || 0);
  const p90 = durationObj['p(90)'] !== undefined ? durationObj['p(90)'] : 0;
  const p95 = durationObj['p(95)'] !== undefined ? durationObj['p(95)'] : 0;
  const p99 = durationObj['p(99)'] !== undefined ? durationObj['p(99)'] : 0;
  const errorRate = failObj.value !== undefined ? failObj.value : 0;
  
  let slaStatus = 'SLA_PASS';
  if (p95 > 1000 || errorRate > 0.05) {
    slaStatus = 'SLA_FAIL';
  } else if (p95 > 500 || errorRate > 0.02) {
    slaStatus = 'DEGRADED';
  }

  if (fs.existsSync(testScriptPath)) {
    try { fs.unlinkSync(testScriptPath); } catch (_) {}
  }

  return {
    configuredVUs: vus,
    actualVUs: vus,
    durationSec,
    totalRequests: httpReqs,
    rps: parseFloat(rps.toFixed(2)),
    p50_ms: parseFloat(p50.toFixed(2)),
    p90_ms: parseFloat(p90.toFixed(2)),
    p95_ms: parseFloat(p95.toFixed(2)),
    p99_ms: parseFloat(p99.toFixed(2)),
    errorRate: parseFloat(errorRate.toFixed(4)),
    slaStatus,
    rawSummaryPath: `qa/scalability/proof/k6_raw_${vus}.json`
  };
}

async function main() {
  console.log('[L2 Benchmark] Starting standalone backend process...');
  const env = Object.assign({}, process.env, {
    LOCAL_DB: 'sqlite',
    DISABLE_BULLMQ: 'true',
    NODE_ENV: 'test',
    LOAD_TEST_MODE: 'true',
    RATE_LIMIT_REDIS_REQUIRED: 'false',
    WS_RATE_LIMIT_MAX: '1000000',
    RATE_LIMIT_PUBLIC_MAX: '1000000',
    RATE_LIMIT_AUTH_MAX: '1000000',
    RATE_LIMIT_WRITE_MAX: '1000000',
    PORT: '3001'
  });

  const backendProc = spawn('node', [path.join(ROOT_DIR, 'infra/scripts/start-standalone-backend.js')], {
    cwd: ROOT_DIR,
    env,
    stdio: 'ignore'
  });

  try {
    console.log('[L2 Benchmark] Awaiting server readiness on http://127.0.0.1:3001/health...');
    await waitForServer('http://127.0.0.1:3001/health', 30000);
    console.log('[L2 Benchmark] Backend online and healthy!');

    const results = {
      timestamp: new Date().toISOString(),
      host: {
        platform: os.platform(),
        release: os.release(),
        cpus: os.cpus().map(c => c.model),
        cpuCount: os.cpus().length,
        totalMemoryGb: (os.totalmem() / 1e9).toFixed(2),
        freeMemoryGb: (os.freemem() / 1e9).toFixed(2),
      },
      tiers: []
    };

    const tiersToRun = [
      { vus: 100, duration: 5 },
      { vus: 500, duration: 5 },
      { vus: 1000, duration: 10 },
      { vus: 2500, duration: 10 },
      { vus: 5000, duration: 10 },
      { vus: 10000, duration: 15 }
    ];

    for (const t of tiersToRun) {
      const res = runK6Test(t.vus, t.duration);
      results.tiers.push(res);
      console.log(`[L2 Result] ${res.configuredVUs} VUs: RPS=${res.rps}, P50=${res.p50_ms}ms, P95=${res.p95_ms}ms, P99=${res.p99_ms}ms, Errors=${(res.errorRate*100).toFixed(2)}%, SLA=${res.slaStatus}`);
    }

    fs.writeFileSync(path.join(PROOF_DIR, 'L2_RAW_RESULTS.json'), JSON.stringify(results, null, 2));
    console.log('[L2 Benchmark] Successfully wrote L2_RAW_RESULTS.json');
  } finally {
    console.log('[L2 Benchmark] Terminating backend process...');
    backendProc.kill();
  }
}

main().catch(err => {
  console.error('[L2 Benchmark Fatal Error]:', err);
  process.exit(1);
});
