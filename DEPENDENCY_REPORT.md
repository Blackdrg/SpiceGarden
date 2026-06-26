# Dependency Report

**Date:** 2026-06-26
**Scope:** SpiceGarden Dependency Analysis
**Classification:** Evidence-based

## Summary

| Category | Count | High/Critical |
|----------|-------|-------------|
| Total Vulnerabilities | 31 | 0 |
| Severity | Moderate | High: 0, Critical: 0 |
| Source | Dev toolchain | @expo/* packages |

## npm audit Results

### Vulnerabilities by Package

| Package | Severity | Affected Versions | Fix Available |
|---------|----------|-----------------|-------------|
| js-yaml | Moderate | <=4.1.1 | Breaking change |
| uuid | Moderate | <11.1.1 | Breaking change |

Both vulnerabilities exist in dev toolchain dependencies through @expo/* packages.

## Backend Dependencies

**File:** `apps/backend/package.json`

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/common | 11.1.27 | NestJS core |
| @nestjs/core | 11.1.27 | NestJS bootstrap |
| @nestjs/platform-express | 11.1.27 | Express adapter |
| @nestjs/platform-socket.io | 11.0.0 | WebSocket support |
| @nestjs/config | ^4.0.0 | Configuration |
| @nestjs/jwt | ^11.0.2 | JWT authentication |
| @nestjs/mongoose | ^11.0.0 | MongoDB |
| @nestjs/typeorm | ^11.0.1 | PostgreSQL ORM |
| @nestjs/schedule | ^6.1.3 | Cron jobs |
| @nestjs/swagger | ^11.2.7 | API documentation |
| @nestjs/throttler | ^6.0.0 | Rate limiting |

### Database

| Package | Version | Purpose |
|---------|---------|---------|
| pg | ^8.11.0 | PostgreSQL driver |
| mongodb | 7.3.0 | MongoDB driver |
| mongoose | 9.7.0 | MongoDB ODM |
| ioredis | ^5.10.1 | Redis client |

### Security

| Package | Version | Purpose |
|---------|---------|---------|
| helmet | ^7.1.0 | Security headers |
| hpp | ^0.2.3 | HTTP param pollution |
| express-rate-limit | ^7.1.5 | Rate limiting |
| mongo-sanitize | ^1.1.0 | Input sanitization |
| argon2 | ^0.40.0 | Password hashing |
| bcrypt | ^6.0.0 | Password hashing |
| crypto-js | ^4.2.0 | Encryption |

### Payments

| Package | Version | Purpose |
|---------|---------|---------|
| stripe | ^15.0.0 | Stripe SDK |

### Monitoring

| Package | Version | Purpose |
|---------|---------|---------|
| prom-client | ^15.0.0 | Prometheus metrics |
| @sentry/node | ^10.58.0 | Error tracking |

## Frontend Dependencies (customer-web)

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.5.18 | Next.js framework |
| react | ^19.2.7 | React |
| react-dom | ^19.2.7 | ReactDOM |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| @reduxjs/toolkit | ^2.2.0 | Redux state |
| @tanstack/react-query | ^5.0.0 | Server state |
| react-redux | ^9.1.0 | React-Redux |

### UI/Communication

| Package | Version | Purpose |
|---------|---------|---------|
| @spicegarden/ui | * | Shared components |
| socket.io-client | ^4.7.0 | WebSocket client |

## Mobile Dependencies

### customer-mobile

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ^56.0.12 | Expo SDK |
| react-native | ^0.85.3 | React Native |
| expo-location | ~56.0.17 | GPS |
| expo-notifications | ~56.0.17 | Push notifications |

### delivery-partner

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ^56.0.12 | Expo SDK |
| expo-location | ~56.0.17 | GPS tracking |

## Shared Packages

### @spicegarden/shared

- Types and constants only
- No external runtime dependencies

### @spicegarden/ui

- Shared React components
- Uses lucide-react for icons (root package)

## Overrides

From root `package.json`:

```json
{
  "engine.io": "^6.6.9",
  "form-data": "^4.0.6",
  "socket.io": "^4.8.3",
  "ws": "^8.21.0",
  "next": "^15.5.18",
  "postcss": "^8.5.10",
  "@nestjs/platform-express": {
    "multer": "2.2.0"
  }
}
```

## Workspace Count

- 12 total workspaces
- 5 shared packages (1 stubbed)
- 6 application packages
- All build/test configured