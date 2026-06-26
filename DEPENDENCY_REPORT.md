# Dependency Report

## Overview

SpiceGarden is an npm workspace monorepo with 12 workspaces (7 apps, 5 packages). This report documents all dependencies, their versions, and health status.

**Source:** `package.json` files across all workspaces

---

## Workspace Inventory

### Apps (7)

| Workspace | Package Name | Framework | Port |
|-----------|-------------|-----------|------|
| `apps/backend` | `@spicegarden/backend` | NestJS 11.1 | 3001 |
| `apps/customer-web` | `@spicegarden/customer-web` | Next.js 15.5 | 3002 |
| `apps/restaurant-dashboard` | `@spicegarden/restaurant-dashboard` | Next.js 15.5 | 3003 |
| `apps/super-admin` | `@spicegarden/super-admin` | Next.js 15.5 | 3004 |
| `apps/customer-mobile` | `@spicegarden/customer-mobile` | Expo 56 | Expo Go |
| `apps/delivery-partner` | `@spicegarden/delivery-partner` | Expo 56 | Expo Go |
| `apps/launcher` | `spicegarden-launcher` | Electron 39 | N/A |

### Packages (5)

| Workspace | Package Name | Purpose |
|-----------|-------------|---------|
| `packages/ui` | `@spicegarden/ui` | Design system (Button, Card, Input, etc.) |
| `packages/shared` | `@spicegarden/shared` | Shared types, constants, API client |
| `packages/api-types` | `@spicegarden/api-types` | TypeScript interfaces |
| `packages/proto` | `@spicegarden/proto` | Protocol buffer definitions |
| `packages/grpc-transport` | `@spicegarden/grpc-transport` | QUARANTINED - placeholder stub |

---

## Root package.json Overrides

| Package | Version | Reason |
|---------|---------|--------|
| `next` | ^15.5.18 | Pinned latest Next.js |
| `socket.io` | ^4.8.3 | Force upgrade from transitive older version |
| `engine.io` | ^6.6.9 | Socket.IO peer dependency |
| `@nestjs/platform-express` multer | 2.2.0 | Pin exact version |

---

## Backend Dependencies (@spicegarden/backend)

### Core Framework
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` - NestJS framework
- `@nestjs/typeorm`, `@nestjs/mongoose` - Database integrations
- `@nestjs/jwt`, `@nestjs/passport` - Authentication
- `@nestjs/throttler` - Rate limiting
- `@nestjs/config` - Environment config
- `@nestjs/platform-socket.io` - WebSockets

### Database
- `typeorm` - ORM for PostgreSQL
- `pg` - PostgreSQL driver
- `mongoose` - MongoDB ODM
- `ioredis` - Redis client
- `bullmq` - Job queue (BullMQ)

### Security
- ` argon2` - Password hashing
- `passport`, `passport-jwt`, `passport-local` - Authentication strategies
- `class-validator`, `class-transformer` - DTO validation
- `helmet` - Security headers (via main.ts)
- `csrf-csrf` or similar - CSRF protection

### Payment
- `stripe` - Stripe SDK (API version 2024-04-10)
- Razorpay via `fetch` - No npm package, raw HTTP

### Communication
- `socket.io` - WebSocket server
- `@socket.io/redis-adapter` or `ioredis` - Redis adapter for Socket.IO scaling

### Utilities
- `crypto-js` - AES encryption
- `express-mongo-sanitize` - NoSQL injection prevention
- `@sentry/node` - Error tracking
- `prom-client` - Prometheus metrics

---

## Frontend Dependencies

### Next.js Apps (customer-web, restaurant-dashboard, super-admin)

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.5.18 | React framework |
| `react` | ^19.2 | UI library |
| `react-dom` | ^19.2 | DOM renderer |
| `@reduxjs/toolkit` | ^2.2 | State management |
| `react-redux` | ^9.1 | Redux React bindings |
| `@tanstack/react-query` | ^5 | Server state management |
| `socket.io-client` | ^4.7 | Real-time client |
| `@spicegarden/ui` | workspace | Design system |
| `@spicegarden/shared` | workspace | Shared constants/types |
| `recharts` | ^2.12 | Charting (super-admin only) |
| `@sentry/nextjs` | ^8 | Error tracking (restaurant-dashboard, super-admin) |

### React Native Apps (customer-mobile, delivery-partner)

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~56 | React Native framework |
| `react-native` | 0.85 | Native UI |
| `@react-navigation/native` | ^6.1 | Navigation |
| `@react-navigation/native-stack` | ^6.9 | Stack navigator |
| `@react-navigation/bottom-tabs` | ^6.5 | Tab navigator |
| `expo-location` | ~56 | GPS tracking |
| `expo-notifications` | ~56 | Push notifications |
| `@react-native-async-storage/async-storage` | ^2.2 | Local storage |
| `react-native-svg` | ^15.15 | SVG support |
| `socket.io-client` | (via workspace) | Real-time client |
| `@spicegarden/ui` | workspace | Design system |
| `@spicegarden/api-types` | workspace | TypeScript interfaces |

### Electron App (launcher)

| Package | Version | Purpose |
|---------|---------|---------|
| `electron` | ^39 | Desktop runtime |
| `electron-builder` | - | Packaging |
| `react` | ^19.2 | UI |
| `react-dom` | ^19.2 | DOM |
| `webpack` | ^5 | Bundler |
| `electron-store` | - | Settings persistence |

---

## Internal Package Dependencies

```
@spicegarden/backend
├── @spicegarden/shared
└── @spicegarden/api-types

@spicegarden/customer-web
├── @spicegarden/ui
├── @spicegarden/shared
└── @spicegarden/api-types

@spicegarden/restaurant-dashboard
├── @spicegarden/ui
└── @spicegarden/shared

@spicegarden/super-admin
├── @spicegarden/ui
├── @spicegarden/shared
└── @spicegarden/api-types

@spicegarden/customer-mobile
├── @spicegarden/ui
├── @spicegarden/shared
└── @spicegarden/api-types

@spicegarden/delivery-partner
└── @spicegarden/api-types
```

---

## Dependency Health

### npm Audit Status
- **31 moderate vulnerabilities** (dev toolchain only)
- **0 high/critical vulnerabilities**
- High severity gate enforced in CI (`npm audit --audit-level=high`)

### Known Vulnerabilities
All 31 moderate vulnerabilities are in dev dependencies (testing tools, build tools). No production dependencies are affected.

### Lockfile Status
- All workspaces use npm workspaces with root `package-lock.json`
- CI enforces `npm ci` for reproducible builds

---

## Version Constraints

| Constraint Type | Count | Examples |
|-----------------|-------|----------|
| Exact (`x.y.z`) | 4 | `@nestjs/core: 11.1.27`, multer pin |
| Caret (`^x.y.z`) | 85% | `react: ^19.2`, `next: ^15.5.18` |
| Tilde (`~x.y.z`) | 10% | `expo: ~56` |
| Workspace (`workspace:*`) | 5 | All internal packages |

---

## Breaking Change Risk

| Package | Current → Latest | Risk |
|---------|------------------|------|
| `next` | 15.5.x → 15.5.x | LOW - pinned via override |
| `react` | 19.2.x → 19.2.x | LOW - stable |
| `@nestjs/core` | 11.1.27 → 11.x | LOW - minor updates only |
| `socket.io` | 4.7.x → 4.8.x | MEDIUM - forced upgrade needed |
| `expo` | 56.x → 56.x | LOW - tilde constraint |
| `electron` | 39.x → 39.x | LOW - minor updates only |

---

## Build Tool Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| `webpack` | ^5 | Electron bundler |
| `typescript` | 5.x | Type checking |
| `eslint` | 8/9 | Linting |
| `electron-builder` | latest | Packaging |
| `next` | 15.5 | Built-in SWC/Turbopack |
