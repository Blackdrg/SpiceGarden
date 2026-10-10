# SpiceGarden Backend Open-Handle & Teardown Audit Report

**Date:** 2026-10-02  
**Target:** `@spicegarden/backend` Jest Test Suite (69 Suites / 1,122 Tests)  
**Status:** FULLY RESOLVED (Clean Teardown / 0 Leaks)

---

## 1. Issue Description

In the baseline execution, Jest reported:
```text
A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
```

---

## 2. Investigation & Root Cause Identification

Using `npx jest --detectOpenHandles --runInBand`, the open resources keeping the Node event loop alive were traced to:

1. **`TrackingGateway` (`src/infra/tracking/tracking.gateway.ts`):**
   * **Root Cause:** In the constructor, two periodic intervals were initialized without holding references or calling `.unref()`:
     - `setInterval(() => this.cleanupStaleConnectionAttempts(), WS_RATE_LIMIT_WINDOW_MS)`
     - `setInterval(() => this.cleanupStaleMessageQueue(), MSG_QUEUE_TTL_MS)`
   * Additionally, `TrackingGateway` did not implement NestJS `OnModuleDestroy` to clear pending ack timeouts or periodic background intervals. When unit tests instantiated `TrackingGateway`, these intervals remained active in the Node runtime.

2. **`DatabaseFailoverService` (`src/db/database-failover.service.ts`):**
   * **Root Cause:** Periodic 30-second database health check interval lacked `.unref()` guard for asynchronous lifecycle transitions.

---

## 3. Implemented Remediation

1. **`TrackingGateway`:**
   * Implemented NestJS `OnModuleDestroy` lifecycle hook.
   * Stored references `cleanupAttemptsInterval` and `cleanupQueueInterval`.
   * Added `.unref()` to both background timers to allow non-blocking process termination.
   * In `onModuleDestroy()`, explicitly executed `clearInterval` on both intervals and cleared all active `pendingAcks` timeout handlers.
2. **`DatabaseFailoverService`:**
   * Added `.unref()` guard to `this.healthCheckInterval` upon timer startup.

---

## 4. Verification & Validation Evidence

* **Command:** `npm test` and `npx jest --detectOpenHandles --runInBand` in `apps/backend`
* **Result:**
  * **Test Suites:** 69 passed, 69 total (100%)
  * **Tests:** 1,122 passed, 1,122 total (100%)
  * **Worker Exit:** Clean graceful termination (0 force-exit warnings)
  * **Open Handles:** None detected
