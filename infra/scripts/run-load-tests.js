#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const isWindows = process.platform === 'win32';
const MAX_WINDOWS_VUS = 1000;

function warnWindowsLimitation() {
    if (isWindows) {
        console.warn('\n⚠️  WINDOWS LOCALHOST SOCKET LIMITATION DETECTED');
        console.warn('   Windows has a low default limit for ephemeral TCP ports hitting localhost.');
        console.warn('   High-VU tests (5k+) will likely fail with EADDRINUSE or connection errors.');
        console.warn('   WORKAROUND: Run load tests via WSL2 or Docker to bypass this limitation.');
        console.warn('   Use: npm run test:load:docker:5k (or higher stages)\n');
    }
}

function clampStagesForPlatform(stages) {
    if (!isWindows) return stages;
    return stages.filter(s => s.vus <= MAX_WINDOWS_VUS);
}

const STAGES = isWindows
    ? [
        { name: '1K Users (Windows cap)', file: 'stage-1-1k.js', vus: 1000, duration: '30m' },
    ]
    : [
        { name: '1K Users', file: 'stage-1-1k.js', vus: 1000, duration: '30m' },
        { name: '5K Users', file: 'stage-2-5k.js', vus: 5000, duration: '30m' },
        { name: '10K Users', file: 'stage-3-10k.js', vus: 10000, duration: '45m' },
        { name: '20K Users', file: 'stage-4-20k.js', vus: 20000, duration: '60m' },
        { name: '50K Users', file: 'stage-5-50k.js', vus: 50000, duration: '90m' },
        { name: '100K Users', file: 'stage-6-100k.js', vus: 100000, duration: '2h' },
        { name: '500K Users', file: 'stage-7-500k.js', vus: 500000, duration: '4h' },
        { name: '1M Users', file: 'stage-8-1m.js', vus: 1000000, duration: '6h+' },
    ];

const SPECIAL_TESTS = [
    { name: 'WebSocket Stress', file: 'websocket-stress.js', vus: isWindows ? 500 : 10000, duration: '10m' },
    { name: 'Database Stress', file: 'database-stress.js', vus: isWindows ? 500 : 5000, duration: '20m' },
    { name: 'Payment Stress', file: 'payment-stress.js', vus: 1000, duration: '15m' },
    { name: 'Failure Injection', file: 'failure-injection.js', vus: isWindows ? 500 : 5000, duration: '15m' },
    { name: 'Security Under Load', file: 'security-under-load.js', vus: isWindows ? 1000 : 10000, duration: '10m' },
];

const BASE_URL = process.env.BASE_URL || (isWindows ? 'http://127.0.0.1:3001' : 'http://localhost:3001');
const RESULTS_DIR = path.join(__dirname, '..', 'load-tests', 'results');

if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

const results = {
    stages: [],
    specialTests: [],
    startTime: new Date().toISOString(),
};

function checkPrerequisites() {
    console.log('=== Checking Prerequisites ===\n');
    
    try {
        console.log('Checking k6 installation...');
        const k6Version = execSync('k6 --version', { encoding: 'utf-8' }).trim();
        console.log('  k6: ' + k6Version + ' installed');
    } catch (e) {
        console.error('  k6 not found. Install from: https://k6.io/docs/getting-started/installation/');
        process.exit(1);
    }
    
    console.log('Checking Docker...');
    try {
        execSync('docker --version', { stdio: 'pipe' });
        console.log('  Docker: installed');
    } catch (e) {
        console.log('  Docker: not available (running in local mode)');
    }
}

function checkBackendHealth() {
    console.log('\nChecking backend health at ' + BASE_URL + '...');
    
    return new Promise((resolve) => {
        const req = http.get(BASE_URL + '/health', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('  Backend health: OK');
                    resolve(true);
                } else {
                    console.log('  Backend health: ' + res.statusCode + ' (may need to start dev stack)');
                    resolve(false);
                }
            });
        });
        req.on('error', () => {
            console.log('  Backend unreachable: start with npm run dev:local:infra');
            resolve(false);
        });
        req.setTimeout(5000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

function runK6Test(testName, testFile, extraEnv = {}) {
    console.log('\n=== Running: ' + testName + ' ===');
    
    const env = Object.assign({}, process.env, { BASE_URL }, extraEnv);
    const startTime = Date.now();
    
    return new Promise((resolve) => {
        const proc = spawn('k6', ['run', 'infra/load-tests/' + testFile], {
            env,
            cwd: path.join(__dirname, '..', '..'),
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
            process.stdout.write(data.toString());
        });
        
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        proc.on('close', (code) => {
            const duration = Date.now() - startTime;
            console.log('\n' + testName + ' completed in ' + Math.round(duration / 1000) + 's');
            
            resolve({
                name: testName,
                status: code === 0 ? 'PASS' : 'FAIL',
                duration,
                stdout,
                stderr,
            });
        });
    });
}

async function runAllTests() {
    checkPrerequisites();
    warnWindowsLimitation();
    const backendOk = await checkBackendHealth();
    
    if (!backendOk && !process.env.FORCE_RUN) {
        console.log('\nBackend not reachable. Start dev infrastructure first:');
        console.log('  npm run dev:local:infra');
        process.exit(1);
    }
    
    console.log('\n========================================');
    console.log('SpiceGarden Production Load Testing Framework');
    console.log('========================================');
    console.log('Target: ' + BASE_URL);
    console.log('Results: ' + RESULTS_DIR);
    
    let passedStages = 0;
    let failedStages = 0;
    
    for (const stage of STAGES) {
        const result = await runK6Test(stage.name, stage.file);
        results.stages.push(result);
        
        if (result.status === 'PASS') {
            passedStages++;
        } else {
            failedStages++;
            if (!process.env.CONTINUE_ON_FAILURE) {
                console.log('\n!!! Stage failed - aborting !!!');
                break;
            }
        }
    }
    
    console.log('\n========================================');
    console.log('Running Special Tests');
    console.log('========================================');
    
    for (const test of SPECIAL_TESTS) {
        const result = await runK6Test(test.name, test.file);
        results.specialTests.push(result);
    }
    
    generateFinalReport();
}

function generateFinalReport() {
    results.endTime = new Date().toISOString();
    const reportPath = path.join(RESULTS_DIR, 'load-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log('\n========================================');
    console.log('FINAL REPORT');
    console.log('========================================');
    
    for (const stage of results.stages) {
        const status = stage.status === 'PASS' ? '✓' : '✗';
        console.log(status + ' ' + stage.name + ': ' + stage.status);
    }
    
    console.log('\nSpecial Tests:');
    for (const test of results.specialTests) {
        const status = test.status === 'PASS' ? '✓' : '✗';
        console.log('  ' + status + ' ' + test.name + ': ' + test.status);
    }
    
    const maxUsers = getMaxPassedUsers();
    console.log('\n========================================');
    console.log('Max Concurrent Users Passed: ' + maxUsers);
    console.log('Report: ' + reportPath);
    console.log('========================================');
}

function getMaxPassedUsers() {
    for (let i = results.stages.length - 1; i >= 0; i--) {
        if (results.stages[i].status === 'PASS') {
            return STAGES[i].vus;
        }
    }
    return 0;
}

runAllTests().catch(e => {
    console.error('Test suite failed:', e);
    process.exit(1);
});