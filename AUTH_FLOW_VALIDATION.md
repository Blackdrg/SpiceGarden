# AUTH_FLOW_VALIDATION

Generated: 2026-06-18 18:26 IST

## Source inspection

| Flow | Source | Expected behavior |
|---|---|---|
| Register | `apps/backend/src/services/auth/auth.controller.ts:34` | `POST /auth/register` checks existing email, hashes password, saves user, calls `AuthService.login()` |
| Login | `apps/backend/src/services/auth/auth.controller.ts:18` | `POST /auth/login` validates credentials, calls `AuthService.login()` |
| JWT creation | `apps/backend/src/services/auth/auth.service.ts:60` | `access_token` signed with JwtService payload `{ email, sub, role }` |
| Refresh token | `apps/backend/src/services/auth/auth.service.ts:68` | Login response includes `refresh_token` |
| JWT validation | `apps/backend/src/services/auth/strategies/jwt.strategy.ts:11` | `Authorization: Bearer <token>` validated by passport-jwt |
| Refresh endpoint | No controller route found | Not implemented |

## Live validation

Current backend is running in local dev mode (`LocalDevModule`), so auth controllers are not mounted.

| Request | Command | Result | PASS/FAIL |
|---|---|---|---|
| Register | `curl.exe --data-binary @.../register-payload.json -H 'Content-Type: application/json' http://localhost:3001/auth/register` | `{"message":"Cannot POST /auth/register","error":"Not Found","statusCode":404}` | FAIL |
| Login | `curl.exe --data-binary @.../login-payload.json -H 'Content-Type: application/json' http://localhost:3001/auth/login` | `{"message":"Cannot POST /auth/login","error":"Not Found","statusCode":404}` | FAIL |
| JWT capture | Not reached | No live token | FAIL |
| JWT protected request | Not reached | No live token | FAIL |
| Refresh | No route found | Not implemented | FAIL |

## Stored JWTs

No valid JWTs were stored because live registration/login did not return tokens.

## k6 impact

- `Bearer mock-token` is invalid and must be removed.
- k6 must register or login and capture `access_token`.
- k6 must not call a refresh endpoint because the backend does not expose one.
- Full auth validation is blocked until the full backend module set is running with PostgreSQL/MongoDB/Redis.
