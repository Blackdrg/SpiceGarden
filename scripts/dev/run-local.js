// run-local.js – orchestrates SpiceGarden local development stack
const { spawn, execSync } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Helper: simple async sleep
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Helper: check command existence & version
function checkCommand(cmd, args = ['-v']) {
  try { execSync(`${cmd} ${args.join(' ')}`, { stdio: 'ignore' }); return true; }
  catch { return false; }
}

// Helper: check if a TCP port is open
function isPortOpen(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('error', () => { socket.destroy(); resolve(false); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host, () => { socket.end(); resolve(true); });
  });
}

// Helper: wait for port to become open
async function waitForPort(host, port, timeoutSec = 60) {
  const deadline = Date.now() + timeoutSec * 1000;
  while (Date.now() < deadline) {
    if (await isPortOpen(host, port)) return true;
    await sleep(2000);
  }
  return false;
}

// Helper: start a service in a new cmd window and pipe logs
function startService(name, command, logFile) {
  const cmd = `start "SpiceGarden ${name}" cmd /k "${command} > ${logFile} 2>&1"`;
  console.log(`[INFO] Launching ${name} → ${command}`);
  spawn('cmd', ['/c', cmd], { stdio: 'inherit', cwd: process.cwd() });
}

// Parse CLI flags
const args = process.argv.slice(2);
const modeFull = args.includes('--full');
const modeInfra = args.includes('--infra');
const modeCheck = args.includes('--check');

async function main() {
  console.log('=== SpiceGarden Local Launcher ===');

  // 1️⃣ Prerequisite checks
  console.log('[STEP] Verifying prerequisites...');
  const prereqs = [
    { cmd: 'node', name: 'Node.js' },
    { cmd: 'npm', name: 'npm' },
    { cmd: 'docker', name: 'Docker' },
    { cmd: 'docker compose', name: 'Docker Compose' },
  ];
  for (const p of prereqs) {
    if (!checkCommand(p.cmd.split(' ')[0])) {
      console.error(`[ERROR] ${p.name} not found. Please install it and ensure it's in PATH.`);
      process.exit(1);
    } else {
      console.log(`[OK] ${p.name} available`);
    }
  }
  const composeFile = path.join(process.cwd(), 'compose.dev.yaml');
  if (!fs.existsSync(composeFile)) {
    console.error('[ERROR] compose.dev.yaml not found in repository root.');
    process.exit(1);
  }
  console.log('[OK] compose.dev.yaml found');

    // 2️⃣ Infra start (unless --check only)
    console.log('[STEP] Starting Docker infrastructure...');
    const baseServices = ['postgres', 'redis', 'mongo'];
    const coreServices = [];
    const obsServices = ['prometheus', 'grafana', 'opensearch', 'opensearch-dashboards', 'alertmanager'];
    let servicesToStart = [...baseServices];
    if (modeFull) servicesToStart = servicesToStart.concat(obsServices);
    const composeCmd = `docker compose -f "${composeFile}" up -d ${servicesToStart.join(' ')}`;
    try {
      execSync(composeCmd, { stdio: 'inherit' });
    } catch (e) {
      console.error('[ERROR] Docker compose failed:', e.message);
      process.exit(1);
    }
    console.log('[OK] Docker containers launched');

    // Wait for infra health (simple port checks)
    const infraChecks = [
      { name: 'Postgres', host: '127.0.0.1', port: 5432 },
      { name: 'Redis', host: '127.0.0.1', port: 6379 },
      { name: 'Mongo', host: '127.0.0.1', port: 27017 },
    ];
    for (const svc of infraChecks) {
      const ok = await waitForPort(svc.host, svc.port, 60);
      console.log(ok ? `[OK] ${svc.name} reachable` : `[WARN] ${svc.name} not reachable after timeout`);
    }

  if (modeCheck) {
    console.log('\n=== Health Summary (check mode) ===');
    // Simple health checks for core services
    const checks = [
      { name: 'Backend', url: 'http://localhost:3001/health' },
      { name: 'Customer Web', url: 'http://localhost:3002' },
      { name: 'Restaurant Dashboard', url: 'http://localhost:3003' },
      { name: 'Super Admin', url: 'http://localhost:3004' },
    ];
    for (const c of checks) {
      try {
        const res = await fetch(c.url);
        console.log(`[OK] ${c.name} responded ${res.status}`);
      } catch (_) {
        console.log(`[WARN] ${c.name} not reachable`);
      }
    }
    return;
  }

  // 3️⃣ Backend start (if not infra‑only)
  if (!modeInfra) {
    console.log('[STEP] Launching Backend...');
    const backendCmd = 'npm --workspace apps/backend run dev';
    const backendLog = path.join('logs', 'backend.log');
    startService('Backend', backendCmd, backendLog);
    // Wait for /health endpoint
    const backendReady = await waitForPort('127.0.0.1', 3001, 120);
    console.log(backendReady ? '[OK] Backend ready' : '[ERROR] Backend failed to start');
  }

  if (!modeInfra) {
    // 4️⃣ Frontend apps start
    const frontends = [
      { name: 'Customer Web', workspace: 'apps/customer-web', port: 3002, script: 'dev' },
      { name: 'Restaurant Dashboard', workspace: 'apps/restaurant-dashboard', port: 3003, script: 'dev' },
      { name: 'Super Admin', workspace: 'apps/super-admin', port: 3004, script: 'dev' },
    ];
    for (const app of frontends) {
      console.log(`[STEP] Launching ${app.name}...`);
      const cmd = `npm --workspace ${app.workspace} run ${app.script}`;
      const log = path.join('logs', `${app.name.toLowerCase().replace(/ /g, '-')}.log`);
      startService(app.name, cmd, log);
    }
    // Poll ports
    for (const app of frontends) {
      const ready = await waitForPort('127.0.0.1', app.port, 120);
      console.log(ready ? `[OK] ${app.name} reachable` : `[WARN] ${app.name} not reachable`);
    }
  }

  // 5️⃣ Observability services (only in full mode)
  if (modeFull) {
    console.log('[STEP] Observability services started via Docker compose (already up).');
  }

  // 6️⃣ Summary & optional browser launch
  console.log('\n=== SpiceGarden local environment is up ===');
  console.log('Backend:               http://localhost:3001');
  console.log('Customer Web:          http://localhost:3002');
  console.log('Restaurant Dashboard:  http://localhost:3003');
  console.log('Super Admin:           http://localhost:3004');
  if (modeFull) {
    console.log('Grafana:               http://localhost:3000');
    console.log('Prometheus:            http://localhost:9090');
    console.log('OpenSearch:            http://localhost:9200');
    console.log('Alertmanager:          http://localhost:9093');
  }
  // Auto‑open core apps in default browser
  const openUrls = ['http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'];
  for (const u of openUrls) {
    try { execSync(`start "" "${u}"`); } catch (_) {}
  }
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
