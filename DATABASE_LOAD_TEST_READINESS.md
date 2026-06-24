# DATABASE_LOAD_TEST_READINESS

Generated: 2026-06-18 18:26 IST

## Configured databases

| Database | Config source | Expected local endpoint |
|---|---|---:|
| PostgreSQL | `.env`, `compose.dev.yaml`, `apps/backend/src/db/db.module.ts` | `localhost:5432` |
| MongoDB | `.env`, `compose.dev.yaml`, `apps/backend/src/db/db.module.ts` | `localhost:27017` |

## Live checks

| Check | Command | Result | PASS/FAIL |
|---|---|---|---|
| PostgreSQL TCP | `Test-NetConnection localhost -Port 5432` | `TcpTestSucceeded: False` | FAIL |
| MongoDB TCP | `Test-NetConnection localhost -Port 27017` | `TcpTestSucceeded: False` | FAIL |
| MongoDB ping | `mongosh mongodb://localhost:27017/spicegarden --eval 'db.adminCommand({ ping: 1 })'` | `MongoNetworkError: connect ECONNREFUSED` | FAIL |

## Backend route checks for DB-backed operations

| Operation | Endpoint | Live result | PASS/FAIL |
|---|---|---|---|
| User creation | `POST /auth/register` | HTTP 404 in local dev mode | FAIL |
| Order creation | `POST /orders` | HTTP 404 in local dev mode | FAIL |
| Restaurant query | `GET /restaurants` | HTTP 404 in local dev mode | FAIL |

## Readiness

- PostgreSQL is not reachable from this workstation.
- MongoDB is not reachable from this workstation.
- Database-backed k6 flows cannot be validated locally.
- Full backend validation requires `docker-compose -f compose.dev.yaml up -d`, but Docker/Docker Compose are not installed on PATH.
