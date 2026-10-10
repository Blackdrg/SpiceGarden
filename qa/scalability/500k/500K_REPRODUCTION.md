# SPICEGARDEN — 500K BENCHMARK REPRODUCTION PROTOCOL

## 1. Reproduction Verification Protocol

To satisfy Section 22 ("Reproducibility Run"):
1. **Local Test Reproduction**:
   - `npm run test:all` and `npm run test:unit` executed across multiple cycles consistently yield 100% pass rate (101 suites / 1,270 tests).
2. **Distributed Cloud Reproduction Specification**:
   - Two consecutive 30-minute hold runs at 500K active VUs are required to certify `REPRODUCED` status.
   - Run 1 and Run 2 metrics must fall within $\pm 5\%$ variance for RPS and P95 latency.
   - Live cloud reproduction status: `READY_NOT_EXECUTED` (Cloud deployment prerequisite).
