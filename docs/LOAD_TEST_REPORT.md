# Load Test Report

**Date:** 2026-06-23

---

## Load Test Status

| Test | Status | Evidence |
| ---- | ------ | -------- |
| Reduced 5-VU smoke | Blocked | Requires running backend + k6 |
| Default 50-VU smoke | Blocked | Requires running backend + k6 |
| 10k users | Blocked | Requires running backend + k6 |
| 20k users | Blocked | Requires running backend + k6 |

---

## Load Test Scripts

**Source:** `apps/backend/test/load/`

The load test scripts exist but have not been executed in this audit:
- `smoke.js` — quick smoke test
- `10k-users.js` — 10,000 VU test
- `20k-users.js` — 20,000 VU test
- `breaking-point.js` — breaking point analysis

---

## Internal Test Script

**Source:** `infra/scripts/fake-orders.js`

Fake order test script exists (149 lines) with:
- 10 test users
- Concurrent order placement
- Health check prerequisite

**Not run:** Requires running backend on port 3001.

---

## Previous Evidence Claims

Previous documentation claimed:
- "5-VU smoke passed: p95 797.07ms"
- "50-VU smoke failed: p95 6.3s vs <1500ms target"

**Status:** Historical claims superseded. Not reproduced in current audit.

---

## Prerequisites for Load Testing

1. Backend running on port 3001
2. k6 installed and available
3. Database seeded with test data