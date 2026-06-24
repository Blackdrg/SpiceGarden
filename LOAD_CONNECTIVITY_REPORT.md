# LOAD_CONNECTIVITY_REPORT

Generated: 2026-06-18 18:26 IST

## k6 target URL

- Current k6 default in `apps/backend/test/load/10k-users.js`: `http://localhost:3001`
- Other scripts also use `http://localhost:3000` or `http://localhost:3001`; this mismatch is invalid because compose exposes backend on `3001`.

## Backend reachability

| Endpoint | Command | Result | PASS/FAIL |
|---|---|---|---|
| `GET /health` | `curl.exe -sS --max-time 5 http://localhost:3001/health` | HTTP 200 after fixing nested `LocalRepositoryModule` providers | PASS |
| `GET /ready` | `curl.exe -sS --max-time 5 http://localhost:3001/ready` | Failed earlier before backend startup; route not implemented in source | FAIL |
| `GET /version` | `curl.exe -sS --max-time 5 http://localhost:3001/version` | Failed earlier before backend startup; route not implemented in source | FAIL |
| `GET /orders/health` | `curl.exe -sS --max-time 5 http://localhost:3001/orders/health` | HTTP 404 in local dev mode because `OrderController` is not mounted | FAIL |
| `GET /restaurants` | `curl.exe -sS --max-time 5 http://localhost:3001/restaurants` | HTTP 404 in local dev mode because `RestaurantController` is not mounted | FAIL |
| `POST /auth/register` | `curl.exe --data-binary @.../register-payload.json http://localhost:3001/auth/register` | HTTP 404 in local dev mode because `AuthController` is not mounted | FAIL |
| `POST /auth/login` | `curl.exe --data-binary @.../login-payload.json http://localhost:3001/auth/login` | HTTP 404 in local dev mode because `AuthController` is not mounted | FAIL |

## Frontend reachability

| URL | Command | Result | PASS/FAIL |
|---|---|---|---|
| `http://localhost:3002/` | `curl.exe -sS --max-time 5 http://localhost:3002/` | Failed to connect | FAIL |
| `http://localhost:3003/` | `curl.exe -sS --max-time 5 http://localhost:3003/` | Failed to connect | FAIL |
| `http://localhost:3004/` | `curl.exe -sS --max-time 5 http://localhost:3004/` | Failed to connect | FAIL |
| `http://localhost:3005/` | `curl.exe -sS --max-time 5 http://localhost:3005/` | Failed to connect | FAIL |

## Production URL reachability

| URL | Command | Result | PASS/FAIL |
|---|---|---|---|
| `https://api.spicegarden.com/` | `curl.exe -sS --max-time 5 https://api.spicegarden.com/` | DNS resolves to `54.237.57.21`; TLS handshake fails with `SEC_E_ILLEGAL_MESSAGE` | FAIL |
| `https://customer.spicegarden.com/` | `curl.exe -sS --max-time 5 https://customer.spicegarden.com/` | DNS resolves to `54.237.57.21`; TLS handshake fails | FAIL |
| `https://restaurant.spicegarden.com/` | `curl.exe -sS --max-time 5 https://restaurant.spicegarden.com/` | DNS resolves to `54.237.57.21`; TLS handshake fails | FAIL |
| `https://admin.spicegarden.com/` | `curl.exe -sS --max-time 5 https://admin.spicegarden.com/` | DNS resolves to `54.237.57.21`; TLS handshake fails | FAIL |

## Infrastructure tooling reachability

| Tool | Command | Result | PASS/FAIL |
|---|---|---|---|
| Docker | `docker --version` | `docker` not recognized | FAIL |
| Docker Compose | `docker-compose -f compose.dev.yaml ps` | `docker-compose` not recognized | FAIL |
| Kubernetes | `kubectl cluster-info` | Refused connection to `localhost:8080` | FAIL |
