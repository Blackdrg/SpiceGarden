# Phase 1 — Runtime Stack Verification Report

**Date:** 2026-06-22
**Status:** PARTIAL — Config validated; Docker runtime blocked by local environment.

---

## 1. What Was Fixed

### Environment / Contract Fixes

| File | Issue | Fix |
|------|-------|-----|
| `apps/backend/src/services/notifications/notification.service.ts` | Read `TWILIO_SID`, but compose/secret-loader use `TWILIO_ACCOUNT_SID` | Changed to `TWILIO_ACCOUNT_SID` |
| `apps/backend/src/services/notifications/production-notification.service.ts` | Same `TWILIO_SID` mismatch | Changed to `TWILIO_ACCOUNT_SID` |
| `infra/prometheus/prometheus.dev.yml` | Target `host.docker.internal:3001` for internal Docker scrape | Changed to `backend:3001` (Docker DNS) |
| `k8s/backend-deployment.yaml` | `containerPort` / probe `port` 3000 (backend is 3001) | Fixed to `3001` |
| `compose.dev.yaml` | `LOCAL_DB=sqlite` caused backend to run SQLite-only inside Docker, making Postgres/Mongo/Redis healthchecks irrelevant | Removed `LOCAL_DB=sqlite` |
| `compose.dev.yaml` | Alertmanager lacked `SLACK_WEBHOOK_URL` / `PAGERDUTY_ROUTING_KEY` env vars | Added with empty defaults |
| `package.json` | No stack verification script | Added `verify:stack` script |
| `infra/k8s/staging.yaml` | Missing file referenced by CI/CD and AGENTS.md | Verified present and valid |
| `.env.example` | Duplicate/unused `TWILIO_SID` and `TWILIO_PHONE` | Removed duplicates |

### New Files

| File | Purpose |
|------|---------|
| `infra/scripts/verify-stack.js` | Node.js stack reachability check script |
| `apps/backend/test/stripe-gateway.spec.ts` | Stripe gateway unit tests (10 cases) |
| `apps/backend/test/razorpay-gateway.spec.ts` | Razorpay gateway unit tests (13 cases) |

---

## 2. Stack Startup Flow

### Local Development (Docker Compose)

```bash
# 1. Start infrastructure
docker-compose -f compose.dev.yaml up -d

# 2. Verify secrets/seeds
node infra/scripts/validate-env-consistency.js
node infra/scripts/validate-secrets.js

# 3. Start backend
cd apps/backend && npm run dev

# 4. Start frontends
npm run dev
```

### Verification

```bash
npm run verify:stack
```

### What `verify:stack` Checks

| Check | URL |
|-------|-----|
| Backend Health | `http://localhost:3001/health` |
| Backend Metrics | `http://localhost:3001/metrics` |
| Grafana | `http://localhost:3000/api/health` |
| Prometheus | `http://localhost:9090/-/healthy` |
| OpenSearch | `http://localhost:9200/_cluster/health` |
| Smoke request | `http://localhost:3001/api/restaurants` |

---

## 3. Runtime Validation State

| Component | Config Valid | Runtime Validated | Notes |
|-----------|-------------|-------------------|-------|
| Docker Compose | PASS | BLOCKED | Docker Desktop not running on this Windows host |
| Postgres | PASS | BLOCKED | Not reachable locally |
| Redis | PASS | BLOCKED | Not reachable locally (rate-limit falls back to memory) |
| Mongo | PASS | BLOCKED | Not reachable locally (mongo-connection tests time out) |
| Backend `/health` | EXISTS | BLOCKED | `app.controller.ts:13` has `@Get('health')` |
| Backend `/metrics` | EXISTS | BLOCKED | `main.ts:252` exposes prom-client endpoint |
| Grafana | Present | BLOCKED | No running instance |
| Prometheus | Present | BLOCKED | No running instance |
| Alertmanager | Present | BLOCKED | No running instance |
| OpenSearch | Present | BLOCKED | No running instance |
| K8s manifests | Present | BLOCKED | No cluster API reachable (`localhost:8080`) |

---

## 4. Known Blockers

1. **Docker Desktop unavailable** — Cannot run compose stack locally on this Windows host.
2. **No Kubernetes cluster** — Cannot validate manifests on a live cluster.
3. **MongoDB tests require running instance** — `mongo-connection.spec.ts` times out without a real Mongo.
4. **Redis falls back to memory** — Rate limiting tests warn about unavailability. Fine for unit tests, but real Redis required for production rate limiting.

---

## 5. Remaining Risks

- **Port mismatch risk:** K8s manifests now all use 3001, but any legacy configs referencing 3000 must be identified and updated.
- **Env drift risk:** `.env.example` had stale `TWILIO_SID`. Any external scripts or docs referencing `TWILIO_SID` need updating.
- **Compose `LOCAL_DB` removal:** Removing `LOCAL_DB=sqlite` means the backend will attempt Postgres/Mongo connections in Docker. If those infra services fail to start, the backend will fail to boot.
