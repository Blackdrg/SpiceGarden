# Dependency Report

## Root Dependencies

**File:** `package.json`

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `class-transformer` | `^0.5.1` | DTO transformation |
| `class-validator` | `^0.15.1` | Validation decorators |
| `electron` | `^42.4.0` | Desktop launcher runtime |
| `multer` | `^2.2.0` | File upload handling |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@babel/generator` | `^7.29.7` | AST code generation |
| `@babel/parser` | `^7.29.7` | JavaScript parser |
| `@babel/traverse` | `^7.29.7` | AST traversal |
| `@testing-library/dom` | `^10.0.0` | DOM testing utilities |
| `ajv` | `^6.15.0` | JSON Schema validation |
| `eslint-scope` | `^5.1.1` | ESLint scope analysis |
| `glob` | `^10.5.0` | File pattern matching |
| `lucide-react` | `^1.20.0` | Icon library |
| `pretty-format` | `^27.5.1` | Pretty-print values |
| `sqlite3` | `6.0.1` | SQLite (exempted in allowScripts) |
| `typescript` | `^5.1.6` | TypeScript compiler |

## Backend Dependencies

**File:** `apps/backend/package.json`

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/common` | `11.1.27` | NestJS core |
| `@nestjs/core` | `11.1.27` | NestJS runtime |
| `@nestjs/config` | `^4.0.0` | Configuration management |
| `@nestjs/jwt` | `^11.0.2` | JWT integration |
| `@nestjs/microservices` | `^11.1.0` | Microservices patterns |
| `@nestjs/mongoose` | `^11.0.0` | MongoDB integration |
| `@nestjs/passport` | `^11.0.5` | Passport integration |
| `@nestjs/platform-express` | `^11.1.27` | Express platform |
| `@nestjs/platform-socket.io` | `^11.0.0` | Socket.IO gateway |
| `@nestjs/schedule` | `^6.1.3` | Cron/scheduled tasks |
| `@nestjs/swagger` | `^11.2.7` | OpenAPI/Swagger docs |
| `@nestjs/throttler` | `^6.0.0` | Rate limiting |
| `@nestjs/typeorm` | `^11.0.1` | TypeORM integration |
| `@nestjs/websockets` | `^11.0.0` | WebSocket gateway |

### Database

| Package | Version | Purpose |
|---------|---------|---------|
| `typeorm` | `1.0.0` | SQL ORM |
| `pg` | `^8.11.0` | PostgreSQL driver |
| `mongodb` | `7.3.0` | MongoDB driver |
| `mongoose` | `9.7.0` | MongoDB ODM |
| `sqlite3` | `6.0.1` | SQLite (fallback/testing) |

### Cache & Queue

| Package | Version | Purpose |
|---------|---------|---------|
| `bullmq` | `^5.78.1` | Queue processing |
| `ioredis` | `^5.10.1` | Redis client |
| `prom-client` | `^15.0.0` | Prometheus metrics |

### Security

| Package | Version | Purpose |
|---------|---------|---------|
| `helmet` | `^7.1.0` | Security headers |
| `hpp` | `^0.2.3` | HPP protection |
| `express-rate-limit` | `^7.1.5` | Rate limiting |
| `mongo-sanitize` | `^1.1.0` | NoSQL injection prevention |
| `passport` | `^0.7.0` | Authentication middleware |
| `passport-jwt` | `^4.0.1` | JWT strategy |
| `passport-google-oauth20` | `^2.0.0` | Google OAuth2 |
| `passport-facebook` | `^3.0.0` | Facebook OAuth2 |
| `argon2` | `^0.40.0` | Password hashing |
| `bcrypt` | `^6.0.0` | Password hashing (fallback) |
| `crypto-js` | `^4.2.0` | Encryption utilities |
| `sha.js` | `^2.4.12` | SHA hashing |

### Payments

| Package | Version | Purpose |
|---------|---------|---------|
| `stripe` | `^15.0.0` | Stripe SDK |

### Observability

| Package | Version | Purpose |
|---------|---------|---------|
| `@sentry/node` | `^10.58.0` | Error tracking |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `@sqltools/formatter` | `^1.2.5` | SQL formatting |
| `app-root-path` | `^3.1.0` | App root path |
| `reflect-metadata` | `^0.2.2` | Decorator metadata |
| `rxjs` | `^7.8.1` | Reactive extensions |

## Frontend Dependencies

### Customer Web

**File:** `apps/customer-web/package.json`

**Key Dependencies:**
- Next.js 15.5.18
- React 19.2.7
- @tanstack/react-query ^5.0
- Redux Toolkit 2.2.0
- react-redux 9.1.0
- socket.io-client ^4.7.0

### Restaurant Dashboard

**File:** `apps/restaurant-dashboard/package.json`

**Key Dependencies:**
- Next.js 15.5.18
- React 19.2.7
- @tanstack/react-query
- socket.io-client
- @sentry/nextjs 10.57

### Super Admin

**File:** `apps/super-admin/package.json`

**Key Dependencies:**
- Next.js 15.5.18
- React 19.2.7
- recharts 2.12
- @tanstack/react-query
- @sentry/nextjs 10.57
- @tanstack/react-query-devtools

### Customer Mobile

**File:** `apps/customer-mobile/package.json`

**Key Dependencies:**
- expo ^56.0.12
- react-native 0.85.3 (via Expo)
- @react-navigation/native ^6.1.8
- @react-navigation/native-stack ^6.9.14
- @react-navigation/bottom-tabs ^6.5.11
- socket.io-client
- expo-location ~56.0.17
- expo-notifications ~56.0.17
- react-native-svg ^15.15.5

### Delivery Partner

**File:** `apps/delivery-partner/package.json`

**Key Dependencies:**
- expo ^56.0 (similar to customer-mobile)
- expo-location
- @react-native-async-storage/async-storage

### Launcher

**File:** `apps/launcher/package.json`

**Key Dependencies:**
- electron ^42.4.0
- electron-builder 26.8
- electron-updater 6.3
- electron-store 8.2
- systeminformation 5.29

## Shared Package Dependencies

### @spicegarden/ui

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | `^1.17.0` | Icon library |

**Dev:** @testing-library/react, jest, ts-jest, typescript, eslint

### @spicegarden/shared

**Zero runtime dependencies**
**Dev:** jest, ts-jest, @types/jest, typescript, eslint

### @spicegarden/api-types

**Zero dependencies** (type-check only)

### @spicegarden/proto

**Zero dependencies** (type-check only)

### @spicegarden/grpc-transport

**Zero dependencies** (QUARANTINED)

## Overrides

**File:** root `package.json`

```json
{
  "overrides": {
    "engine.io": "^6.6.9",
    "form-data": "^4.0.6",
    "socket.io": "^4.8.3",
    "ws": "^8.21.0",
    "next": {
      ".": "^15.5.18",
      "postcss": "^8.5.10"
    },
    "postcss": "^8.5.10",
    "@nestjs/platform-express": {
      "multer": "2.2.0"
    },
    "@nestjs/platform-express@11.1.27": {
      "multer": "2.2.0"
    }
  }
}
```

## Security Audit

**Command:** `npm audit --audit-level=high`

**Results:**
- High/Critical: 0
- Moderate: 31
- All moderate issues are in dev toolchain:
  - `js-yaml` (via @istanbuljs/load-nyc-config → babel-plugin-istanbul → Jest)
  - `uuid` (via sockjs → webpack-dev-server, xcode → @expo/config-plugins)

**Remediation:**
- `npm audit fix` available without breaking changes
- Fix would require `npm audit fix --force` which would cause breaking changes (@nestjs/swagger downgrade)

## Dependency Graph

```
spicegarden (monorepo root)
├─ apps/backend (NestJS + TypeORM + Socket.IO)
│  └─ 30+ runtime deps
├─ apps/customer-web (Next.js + React)
│  └─ 10+ runtime deps
├─ apps/restaurant-dashboard (Next.js + React)
│  └─ 8+ runtime deps
├─ apps/super-admin (Next.js + React)
│  └─ 8+ runtime deps
├─ apps/customer-mobile (Expo + React Native)
│  └─ 12+ runtime deps
├─ apps/delivery-partner (Expo + React Native)
│  └─ 6+ runtime deps
├─ apps/launcher (Electron)
│  └─ 8+ runtime deps
├─ packages/ui (React components)
│  └─ lucide-react
├─ packages/shared (TypeScript utilities)
│  └─ 0 runtime deps
├─ packages/api-types (TypeScript contracts)
│  └─ 0 deps
├─ packages/proto (TypeScript interfaces)
│  └─ 0 deps
└─ packages/grpc-transport (QUARANTINED)
   └─ 0 deps
```

## Lock File

- **package-lock.json** present at root
- Workspace mode enabled
- `.package-lock.json` in node_modules (npm workspace behavior)
