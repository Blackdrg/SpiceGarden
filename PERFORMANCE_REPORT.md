# Performance Report

Generated: 2026-06-17T21:30+05:30  
Evidence: `LOAD_TEST_REPORT.md`, load script scan, backend queue/order code, compose manifests, k8s HPA.

## Performance Evidence

| Area | Evidence |
| :--- | :--- |
| Load testing | `apps/backend/test/load/10k-users.js` exists |
| k6 script issue | `npm run test:load --workspace @spicegarden/backend` failed with duplicate `http_req_duration` metric |
| Root cause | `const http_req_duration = new Trend('http_req_duration');` conflicts with k6 built-in metric |
| Queue architecture | `apps/backend/src/infra/queue/queue.service.ts`, `order.processor.ts` |
| Realtime updates | `apps/backend/src/infra/tracking/tracking.gateway.ts` |
| Scaling config | `infra/k8s/production-hardened.yaml` includes HPA |

## Load Test Result

`npm run test:load --workspace @spicegarden/backend` failed before producing valid performance metrics because the k6 script redefines the built-in `http_req_duration` metric.

## Performance Readiness

- Async order processing exists through BullMQ.
- Production Kubernetes manifest includes horizontal pod autoscaling.
- Load testing is not currently a reliable readiness signal because the k6 script fails at metric definition time.

## Performance Gaps

- Fix k6 built-in metric conflict before using load tests as a performance gate.
- Validate backend throughput after load-test script is fixed.
- Review queue retry/concurrency behavior under realistic order volumes.
