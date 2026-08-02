const http = require("http");
const { EventEmitter } = require("events");

const API_HOST = process.env.API_HOST || "localhost";
const API_PORT = parseInt(process.env.API_PORT || "3001", 10);
const CHECK_INTERVAL_MS = parseInt(process.env.CHECK_INTERVAL_MS || "60000", 10);
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK || "";

const ENDPOINTS = [
  { path: "/health", method: "GET", expectedStatus: 200, name: "health" },
  { path: "/metrics", method: "GET", expectedStatus: 200, name: "metrics" },
  { path: "/api/orders", method: "GET", expectedStatus: 200, name: "orders-list" },
  { path: "/api/auth/me", method: "GET", expectedStatus: 401, name: "auth-me" },
];

class SyntheticMonitor extends EventEmitter {
  constructor() {
    super();
    this.results = [];
    this.running = false;
  }

  async checkEndpoint(endpoint) {
    const start = Date.now();
    return new Promise((resolve) => {
      const options = {
        hostname: API_HOST,
        port: API_PORT,
        path: endpoint.path,
        method: endpoint.method,
        timeout: 5000,
      };
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const duration = Date.now() - start;
          const passed = res.statusCode === endpoint.expectedStatus;
          resolve({
            name: endpoint.name,
            status: res.statusCode,
            expectedStatus: endpoint.expectedStatus,
            duration,
            passed,
            error: null,
          });
        });
      });
      req.on("error", (err) => {
        const duration = Date.now() - start;
        resolve({
          name: endpoint.name,
          status: 0,
          expectedStatus: endpoint.expectedStatus,
          duration,
          passed: false,
          error: err.message,
        });
      });
      req.on("timeout", () => {
        req.destroy();
        const duration = Date.now() - start;
        resolve({
          name: endpoint.name,
          status: 0,
          expectedStatus: endpoint.expectedStatus,
          duration,
          passed: false,
          error: "timeout",
        });
      });
      req.end();
    });
  }

  async runCheck() {
    const results = [];
    for (const endpoint of ENDPOINTS) {
      const result = await this.checkEndpoint(endpoint);
      results.push(result);
      this.emit("check", result);
    }
    const allPassed = results.every((r) => r.passed);
    const failedCount = results.filter((r) => !r.passed).length;
    const avgDuration =
      results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    const summary = {
      timestamp: new Date().toISOString(),
      allPassed,
      failedCount,
      totalChecks: results.length,
      avgDurationMs: Math.round(avgDuration),
      results,
    };

    this.results.push(summary);
    this.emit("summary", summary);

    if (!allPassed && ALERT_WEBHOOK) {
      try {
        const webhookReq = http.request(
          {
            hostname: new URL(ALERT_WEBHOOK).hostname,
            port: 443,
            path: new URL(ALERT_WEBHOOK).pathname,
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
          () => {}
        );
        webhookReq.write(JSON.stringify(summary));
        webhookReq.end();
      } catch {
        // silent fail for webhook
      }
    }

    return summary;
  }

  async start() {
    if (this.running) return;
    this.running = true;
    console.log("[SyntheticMonitor] Starting synthetic monitoring...");
    while (this.running) {
      try {
        await this.runCheck();
      } catch (err) {
        console.error("[SyntheticMonitor] Check failed:", err.message);
      }
      await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
    }
  }

  stop() {
    this.running = false;
    console.log("[SyntheticMonitor] Stopped");
  }

  getRecentResults(count = 10) {
    return this.results.slice(-count);
  }
}

if (require.main === module) {
  const monitor = new SyntheticMonitor();
  monitor.start();
  process.on("SIGINT", () => {
    monitor.stop();
    process.exit(0);
  });
}

module.exports = { SyntheticMonitor };