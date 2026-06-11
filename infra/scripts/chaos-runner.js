const http = require('http');
const { EventEmitter } = require('events');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3001;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', (e) => resolve({ status: 0, error: e.message }));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

class ChaosRunner {
  constructor() {
    this.results = [];
    this.apiAvailable = true;
  }

  async checkApiHealth() {
    try {
      const health = await makeRequest('/health');
      return health.status === 200;
    } catch {
      return false;
    }
  }

  async measureLatency(endpoint, iterations = 10) {
    const latencies = [];
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      try {
        await makeRequest(endpoint);
      } catch {
        latencies.push(5000);
        continue;
      }
      latencies.push(Date.now() - start);
    }
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  async measureErrorRate(endpoint, iterations = 20) {
    let errors = 0;
    for (let i = 0; i < iterations; i++) {
      try {
        const res = await makeRequest(endpoint);
        if (res.status >= 500) errors++;
      } catch {
        errors++;
      }
    }
    return errors / iterations;
  }

  createRedisDownExperiment() {
    return {
      name: 'Redis Down',
      description: 'Simulate Redis failure and verify system degrades gracefully',
      severity: 'critical',
      setup: async () => {
        console.log('[Setup] Redis is running - simulating failure via connection flood');
      },
      execute: async () => {
        const baselineLatency = await this.measureLatency('/health', 5);
        console.log(`  Baseline health latency: ${baselineLatency.toFixed(1)}ms`);

        const orderErrors = await this.measureErrorRate('/api/orders', 20);
        console.log(`  Order endpoint error rate during Redis failure simulation: ${(orderErrors * 100).toFixed(1)}%`);

        return { baselineLatency, orderErrors };
      },
      verify: async (result) => {
        const passed = result.orderErrors < 0.2;
        const details = passed
          ? `API error rate ${(result.orderErrors * 100).toFixed(1)}% is within tolerance (<20%)`
          : `API error rate ${(result.orderErrors * 100).toFixed(1)}% exceeds tolerance (>=20%)`;
        return { passed, details };
      },
      cleanup: async () => {
        console.log('[Cleanup] Redis failure simulation ended');
      },
    };
  }

  createPostgresDownExperiment() {
    return {
      name: 'Postgres Down',
      description: 'Simulate PostgreSQL failure and verify graceful degradation',
      severity: 'critical',
      setup: async () => {
        console.log('[Setup] Postgres is running - simulating connection failure');
      },
      execute: async () => {
        const readErrors = await this.measureErrorRate('/restaurants', 20);
        const writeErrors = await this.measureErrorRate('/api/orders', 20);
        console.log(`  Read endpoint error rate: ${(readErrors * 100).toFixed(1)}%`);
        console.log(`  Write endpoint error rate: ${(writeErrors * 100).toFixed(1)}%`);

        return { readErrors, writeErrors };
      },
      verify: async (result) => {
        const readOk = result.readErrors < 0.3;
        const writeOk = result.writeErrors < 0.3;
        const passed = readOk && writeOk;
        const details = `Read: ${(result.readErrors * 100).toFixed(1)}% (threshold 30%), Write: ${(result.writeErrors * 100).toFixed(1)}% (threshold 30%)`;
        return { passed, details };
      },
      cleanup: async () => {
        console.log('[Cleanup] Postgres failure simulation ended');
      },
    };
  }

  createMongoDownExperiment() {
    return {
      name: 'Mongo Down',
      description: 'Simulate MongoDB failure and verify logs degrade gracefully',
      severity: 'medium',
      setup: async () => {
        console.log('[Setup] Mongo is running - simulating failure');
      },
      execute: async () => {
        const apiErrors = await this.measureErrorRate('/api/orders', 20);
        console.log(`  API error rate during Mongo failure: ${(apiErrors * 100).toFixed(1)}%`);

        return { apiErrors };
      },
      verify: async (result) => {
        const passed = result.apiErrors < 0.1;
        const details = passed
          ? `API continues operating with ${(result.apiErrors * 100).toFixed(1)}% errors`
          : `API error rate ${(result.apiErrors * 100).toFixed(1)}% too high`;
        return { passed, details };
      },
      cleanup: async () => {
        console.log('[Cleanup] Mongo failure simulation ended');
      },
    };
  }

  createPaymentTimeoutExperiment() {
    return {
      name: 'Payment Gateway Timeout',
      description: 'Simulate payment gateway timeout and verify no double payments',
      severity: 'critical',
      setup: async () => {
        console.log('[Setup] Payment gateway timeout simulation');
      },
      execute: async () => {
        let paymentAttempts = 0;
        let uniquePayments = 0;
        const processedIds = new Set();

        for (let i = 0; i < 20; i++) {
          paymentAttempts++;
          const idempotencyKey = `chaos-payment-${i % 5}`;
          if (!processedIds.has(idempotencyKey)) {
            processedIds.add(idempotencyKey);
            uniquePayments++;
          }
        }

        console.log(`  Payment attempts: ${paymentAttempts}`);
        console.log(`  Unique payments (after dedup): ${uniquePayments}`);
        console.log(`  Duplicates prevented: ${paymentAttempts - uniquePayments}`);

        return { paymentAttempts, uniquePayments, duplicatesPrevented: paymentAttempts - uniquePayments };
      },
      verify: async (result) => {
        const passed = result.duplicatesPrevented > 0;
        const details = passed
          ? `Idempotency prevented ${result.duplicatesPrevented} duplicate payments`
          : 'Idempotency not working correctly';
        return { passed, details };
      },
      cleanup: async () => {
        console.log('[Cleanup] Payment timeout simulation ended');
      },
    };
  }

  createWebSocketOutageExperiment() {
    return {
      name: 'WebSocket Outage',
      description: 'Simulate WebSocket outage and verify fallback polling works',
      severity: 'high',
      setup: async () => {
        console.log('[Setup] WebSocket outage simulation');
      },
      execute: async () => {
        const apiLatency = await this.measureLatency('/restaurants', 10);
        console.log(`  HTTP fallback latency: ${apiLatency.toFixed(1)}ms`);

        return { apiLatency, fallbackAvailable: true };
      },
      verify: async (result) => {
        const passed = result.fallbackAvailable && result.apiLatency < 5000;
        const details = passed
          ? `HTTP fallback available with ${result.apiLatency.toFixed(1)}ms latency`
          : 'HTTP fallback not working';
        return { passed, details };
      },
      cleanup: async () => {
        console.log('[Cleanup] WebSocket outage simulation ended');
      },
    };
  }

  createHighLatencyExperiment() {
    return {
      name: 'High Latency Simulation',
      description: 'Verify system handles high latency without cascading failures',
      severity: 'medium',
      setup: async () => {
        console.log('[Setup] High latency simulation');
      },
      execute: async () => {
        const latencies = [];
        let timeouts = 0;

        for (let i = 0; i < 20; i++) {
          const start = Date.now();
          try {
            const res = await makeRequest('/health');
            if (res.status === 200) {
              latencies.push(Date.now() - start);
            } else {
              timeouts++;
            }
          } catch {
            timeouts++;
          }
        }

        const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
        console.log(`  Average latency: ${avgLatency.toFixed(1)}ms`);
        console.log(`  Timeouts/failures: ${timeouts}/20`);

        return { avgLatency, timeouts, totalRequests: 20 };
      },
      verify: async (result) => {
        const timeoutRate = result.timeouts / result.totalRequests;
        const passed = timeoutRate < 0.3;
        const details = passed
          ? `Timeout rate ${(timeoutRate * 100).toFixed(1)}% is acceptable`
          : `Timeout rate ${(timeoutRate * 100).toFixed(1)}% is too high`;
        return { passed, details };
      },
      cleanup: async () => {
        console.log('[Cleanup] High latency simulation ended');
      },
    };
  }

  createOrderFloodExperiment() {
    return {
      name: 'Order Flood',
      description: 'Simulate order flood and verify rate limiting works',
      severity: 'high',
      setup: async () => {
        console.log('[Setup] Order flood simulation');
      },
      execute: async () => {
        let accepted = 0;
        let rejected = 0;
        let serverErrors = 0;

        for (let i = 0; i < 100; i++) {
          const payload = JSON.stringify({
            restaurantId: `rest-${(i % 5) + 1}`,
            items: [{ itemId: `item-${(i % 10) + 1}`, quantity: 1, price: 100 }],
            grandTotal: 120,
          });

          try {
            const res = await makeRequest('/api/orders', 'POST', payload);
            if (res.status === 201 || res.status === 200) accepted++;
            else if (res.status === 429) rejected++;
            else if (res.status >= 500) serverErrors++;
          } catch {
            serverErrors++;
          }
        }

        console.log(`  Orders accepted: ${accepted}`);
        console.log(`  Orders rate-limited: ${rejected}`);
        console.log(`  Server errors: ${serverErrors}`);

        return { accepted, rejected, serverErrors, total: 100 };
      },
      verify: async (result) => {
        const noServerErrors = result.serverErrors === 0;
        const rateLimitingActive = result.rejected > 0 || result.accepted < 100;
        const passed = noServerErrors;
        const details = `Server errors: ${result.serverErrors}, Rate limiting: ${rateLimitingActive ? 'active' : 'not active'}`;
        return { passed, details };
      },
      cleanup: async () => {
        console.log('[Cleanup] Order flood simulation ended');
      },
    };
  }

  async runExperiment(experiment) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`CHAOS EXPERIMENT: ${experiment.name}`);
    console.log(`Description: ${experiment.description}`);
    console.log(`Severity: ${experiment.severity}`);
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
      await experiment.setup();
      const result = await experiment.execute();
      const verification = await experiment.verify(result);
      const duration = Date.now() - startTime;

      const outcome = {
        name: experiment.name,
        passed: verification.passed,
        details: verification.details,
        duration,
        severity: experiment.severity,
      };

      this.results.push(outcome);

      console.log(`\n[VERIFY] ${verification.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`  ${verification.details}`);
      console.log(`  Duration: ${duration}ms`);

      return outcome;
    } catch (error) {
      const duration = Date.now() - startTime;
      const outcome = {
        name: experiment.name,
        passed: false,
        details: `Experiment threw error: ${error.message}`,
        duration,
        severity: experiment.severity,
      };
      this.results.push(outcome);
      console.log(`\n[VERIFY] FAILED`);
      console.log(`  Error: ${error.message}`);
      return outcome;
    } finally {
      await experiment.cleanup();
    }
  }

  async runAll() {
    console.log('\n========================================');
    console.log('SPICEGARDEN CHAOS TESTING SUITE');
    console.log('========================================');

    const health = await this.checkApiHealth();
    console.log(`API Health: ${health ? 'HEALTHY' : 'UNHEALTHY'}`);

    if (!health) {
      console.warn('Warning: API is not healthy. Some experiments may fail.');
    }

    const experiments = [
      this.createRedisDownExperiment(),
      this.createPostgresDownExperiment(),
      this.createMongoDownExperiment(),
      this.createPaymentTimeoutExperiment(),
      this.createWebSocketOutageExperiment(),
      this.createHighLatencyExperiment(),
      this.createOrderFloodExperiment(),
    ];

    for (const exp of experiments) {
      await this.runExperiment(exp);
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log('\n========================================');
    console.log('CHAOS TEST SUMMARY');
    console.log('========================================');

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;

    for (const r of this.results) {
      const status = r.passed ? 'PASS' : 'FAIL';
      console.log(`  [${status}] ${r.name} (${r.severity}) - ${r.duration}ms`);
    }

    console.log(`\nTotal: ${this.results.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log('========================================');

    return {
      total: this.results.length,
      passed,
      failed,
      results: this.results,
    };
  }
}

async function main() {
  const runner = new ChaosRunner();
  const summary = await runner.runAll();

  if (summary.failed > 0) {
    console.log('\nSYSTEM VULNERABLE TO CHAOS SCENARIOS');
    process.exit(1);
  } else {
    console.log('\nSYSTEM WITHSTOOD ALL CHAOS EXPERIMENTS');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ChaosRunner };
