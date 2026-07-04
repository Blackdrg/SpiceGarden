# SpiceGarden Dependency Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of package.json files and npm audit/outdated outputs

## 1. Root Dependencies

### 1.1 Runtime Dependencies (package.json)

| Package | Version | Purpose | Vulnerability |
|---------|---------|---------|---------------|
| class-transformer | ^0.5.1 | Backend DTO transformation | None |
| class-validator | ^0.15.1 | Backend validation | None |
| electron | ^42.4.0 | Desktop launcher | None (dev toolchain) |
| multer | ^2.2.0 | File uploads | None |

### 1.2 Dev Dependencies

| Package | Version | Purpose | Outdated |
|---------|---------|---------|----------|
| @babel/generator | ^7.29.7 | AST processing | → 8.0.0 |
| @babel/parser | ^7.29.7 | AST parsing | → 8.0.0 |
| @babel/traverse | ^7.29.7 | AST traversal | → 8.0.0 |
| @nestjs/typeorm | ^11.0.1 | NestJS TypeORM integration | No |
| @testing-library/dom | ^10.0.0 | DOM testing | No |
| @testing-library/jest-dom | ^6.9.1 | Jest matchers | No |
| @types/jest | ^30.0.0 | Jest types | → 30.0.0 |
| @types/node | ^26.1.0 | Node types | Current |
| ajv | ^6.15.0 | JSON schema validation | → 8.20.0 |
| eslint-plugin-react | ^7.37.5 | React linting | No |
| acorn-jsx | ^5.3.2 | JSX parser | No |
| eslint-scope | ^5.1.1 | ESLint scope analysis | → 9.1.2 |
| glob | ^10.5.0 | File globbing | → 13.0.6 |
| lucide-react | ^1.20.0 | Icons | → 1.23.0 |
| pretty-format | ^27.5.1 | Pretty printing | → 30.4.1 |
| sqlite3 | 6.0.1 | SQLite for local dev | No |

### 1.3 Overrides

| Package | Override | Reason |
|---------|----------|--------|
| engine.io | ^6.6.9 | Socket.IO compatibility |
| form-data | ^4.0.6 | Form data handling |
| socket.io | ^4.8.3 | WebSocket compatibility |
| ws | ^8.21.0 | WebSocket compatibility |
| next | 15.5.18 + postcss 8.5.10 | Next.js compatibility |
| postcss | ^8.5.10 | CSS processing |
| @nestjs/platform-express | multer 2.2.0 | File upload compatibility |
| @nestjs/platform-express@11.1.27 | multer 2.2.0 | File upload compatibility |

## 2. App Dependencies Summary

### 2.1 Backend (@spicegarden/backend)

| Category | Key Packages |
|----------|-------------|
| Framework | @nestjs/core 11.1.27, @nestjs/platform-express 11.1.27 |
| ORM | typeorm 0.2.45, @nestjs/typeorm 11.0.1 |
| ODM | mongoose 9.7.0, @nestjs/mongoose 11.0.0, mongodb 7.3.0 |
| Auth | passport 0.7.0, passport-jwt 4.0.1, passport-google-oauth20 2.0.0, passport-facebook 3.0.0, argon2 0.40.0, bcrypt 6.0.0 |
| Queue | bullmq 5.78.1, ioredis 5.10.1 |
| Realtime | socket.io 4.7.0, @nestjs/platform-socket.io 11.0.0 |
| Security | helmet 7.1.0, express-rate-limit 7.1.5, hpp 0.2.3 |
| Logging | @sentry/node 10.58.0, prom-client 15.0.0 |
| Payments | stripe 15.0.0 |
| Utils | reflect-metadata, rxjs, compression, cookie-parser, mongo-sanitize |

### 2.2 Frontend Apps

| App | Framework | State | API | Charts |
|-----|-----------|-------|-----|--------|
| customer-web | Next.js 15.5.19 | Redux Toolkit + React Query | fetch + @spicegarden/shared/api | - |
| restaurant-dashboard | Next.js 15.5.19 | useReducer + React Query | fetch + Socket.IO | recharts 2.15.4 |
| super-admin | Next.js 15.5.19 | useReducer + React Query | fetch + Socket.IO | recharts 2.15.4 |

### 2.3 Mobile Apps

| App | Framework | Navigation | Storage | Native |
|-----|-----------|------------|---------|--------|
| customer-mobile | Expo 56.0.13 | React Navigation | AsyncStorage | expo-location, expo-notifications, expo-haptics |
| delivery-partner | Expo 56.0.13 | None (inline tabs) | AsyncStorage | expo-location |

### 2.4 Desktop

| App | Framework | Build | Store |
|-----|-----------|-------|-------|
| launcher | Electron 39.8.10 | webpack 5.107.2 | electron-store 8.2.0 |

## 3. Dependency Health

### 3.1 Vulnerabilities (from npm audit)

| Severity | Count | Packages | Fix Available |
|----------|-------|----------|---------------|
| Critical | 0 | - | - |
| High | 0 | - | - |
| Moderate | 12 | uuid, sockjs, xcode (transitive via expo) | `npm audit fix --force` (breaking) |
| Low | 0 | - | - |

**All moderate vulnerabilities are in dev toolchain (webpack-dev-server, xcode, expo). No production vulnerabilities.**

### 3.2 Outdated Packages (from npm outdated)

| Category | Packages | Risk |
|----------|----------|------|
| React ecosystem | react-native 0.85.3 → 0.86.0 | Low |
| Next.js | 15.5.19 → 15.5.20 | Low |
| NestJS | 11.0.21 → 11.0.23 | Low |
| Stripe | 15.12.0 → 22.3.0 | Medium (major version jump) |
| Electron | 39.8.10 → 43.0.0 | Medium (major version jump) |
| TypeScript | 5.2-5.9 → 6.0.3 | Medium |
| Jest | 29.7.0 → 30.4.2 | Medium |
| @types/node | 20.19.43 → 26.1.0 | Medium |
| ESLint | 8.57.1 → 10.6.0 | Medium (major version jump) |

## 4. Duplicate Packages

| Package | Locations | Versions | Risk |
|---------|-----------|----------|------|
| @typescript-eslint/parser | 10 locations | 5.62.0, 8.61.0 | Medium (mixed configs) |
| @typescript-eslint/eslint-plugin | 10 locations | 5.62.0, 8.61.0 | Medium (mixed configs) |
| typescript | 12 locations | 5.2.2, 5.9.3 | Low (workspaces manage own) |
| eslint | 12 locations | 8.57.1, 9.39.4 | Low (workspaces manage own) |
| jest | 9 locations | 29.7.0 | Low (consistent) |
| lucide-react | 2 locations | 1.20.0 | Low (consistent) |

## 5. Peer Dependency Conflicts

No peer dependency conflicts detected in root install.

## 6. License Issues

All detected licenses are MIT-compatible:
- React (MIT)
- NestJS (MIT)
- Next.js (MIT)
- Express (MIT)
- TypeORM (MIT)
- Mongoose (MIT)

## 7. Security Vulnerabilities Detail

### uuid <11.1.1 (Moderate)
- **Advisory**: GHSA-w5hq-g745-h8pq
- **Issue**: Missing buffer bounds check in v3/v5/v6
- **Impact**:仅开发工具链 (webpack-dev-server, xcode, expo)
- **Fix**: `npm audit fix --force` (requires breaking changes)

## 8. Recommendations

| Priority | Recommendation |
|----------|---------------|
| P1 | Audit Stripe major version upgrade (15 → 22) |
| P1 | Audit Electron version alignment (39.8.10 vs 42.4.0) |
| P2 | Standardize TypeScript versions across workspaces |
| P2 | Standardize ESLint versions |
| P3 | Update @types/node to 26.x |
| P3 | Remove `uuid` vulnerability via `npm audit fix` |
| P3 | Clean up duplicate @typescript-eslint packages |