# Production Runbook

**Version:** 1.0.0
**Audience:** On-call SRE / Platform Engineering

## 1. Services & Ports
| Service | Port | Health |
|---------|------|--------|
| Backend (NestJS) | 3001 | `GET /health`, `GET /metrics` |
| Customer Web | 3002 | `GET /` |
| Restaurant Dashboard | 3003 | `GET /` |
| Super Admin | 3004 | `GET /` |
| Grafana | 3000 | `/api/health` (needs `--full`) |
| Prometheus | 9090 | `/-/healthy` (needs `--full`) |
| OpenSearch | 9200 | `/_cluster/health` (needs `--full`) |
| Alertmanager | 9093 | `/-/healthy` (needs `--full`) |
| Postgres | 5432 | internal |
| Redis | 6379 | internal |
| Mongo | 27017 | internal |

## 2. Start the stack
```bash
# Core infra (Postgres/Redis/Mongo) + apps via launcher
npm run dev:local                 # apps only
docker compose -f compose.dev.yaml up -d        # infra
docker compose -f compose.dev.yaml --profile mobile-web-smoke up -d   # + mobile smoke
# Full observability:
docker compose -f compose.dev.yaml up -d grafana prometheus opensearch alertmanager
```

## 3. Health verification
```bash
node infra/scripts/verify-stack.js      # backend + (if up) observability
npm run dev:local:check               # all apps 200 + infra reachable
```

## 4. Routine operations
- **View logs:** `docker compose -f compose.dev.yaml logs -f <service>`
- **Backend hot reload:** `cd apps/backend && npm run dev`
- **Rotate secrets:** `powershell -File infra/scripts/generate-secrets.ps1` then restart.
- **Migrations:** `npm run migration:show` / `npm run migration:run` (backend).

## 5. Common failure modes
| Symptom | Likely cause | Action |
|----------|-------------|--------|
| `/health` 500 | DB unreachable | check `docker ps` for postgres; verify `DATABASE_URL` |
| Auth 401 storms | JWT secret mismatch after rotate | redeploy all apps with same secret |
| Rate-limit 429 | load test mode off under load | set `LOAD_TEST_MODE=true` for load runs only |
| Migrations pending | drift | `npm run migration:show`; never rename migration classes |

## 6. Escalation
See `docs/RELIABILITY_TESTING.md` (Severity Matrix + Escalation Matrix). P1 pages Security Lead + EM + DPO.
