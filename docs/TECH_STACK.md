# SpiceGarden Tech Stack

**Version:** 0.0.0  
**Last Updated:** 2026-06-27  
**Source:** Verified against `package.json` files

---

## Core Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x | Backend runtime |
| **Backend** | NestJS | 11.1.27 | API server |
| **Frontend** | Next.js | 15.5.18 | Web applications |
| **Mobile** | Expo React Native | 56.0.12 | Mobile apps |
| **Desktop** | Electron | 39-42 | Windows launcher |

---

## Backend Dependencies

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **Core** | `@nestjs/common` | 11.1.27 | NestJS core |
| | `@nestjs/core` | 11.1.27 | NestJS core |
| | `@nestjs/config` | ^4.0.0 | Configuration |
| | `@nestjs/jwt` | ^11.0.2 | JWT module |
| | `@nestjs/passport` | ^11.0.5 | Passport integration |
| | `@nestjs/platform-express` | ^11.1.27 | Express adapter |
| | `@nestjs/platform-socket.io` | ^11.0.0 | Socket.IO adapter |
| | `@nestjs/websockets` | ^11.0.0 | WebSockets |
| | `@nestjs/schedule` | ^6.1.3 | Cron jobs |
| | `@nestjs/swagger` | ^11.2.7 | API docs |
| | `@nestjs/throttler` | ^6.0.0 | Rate limiting |
| | `@nestjs/typeorm` | ^11.0.1 | TypeORM integration |
| | `@nestjs/mongoose` | ^11.0.0 | MongoDB integration |
| | `@nestjs/microservices` | ^11.1.0 | Microservices |
| **Database** | `typeorm` | 1.0.0 | ORM |
| | `pg` | ^8.11.0 | PostgreSQL driver |
| | `mongodb` | 7.3.0 | MongoDB driver |
| | `mongoose` | 9.7.0 | MongoDB ODM |
| | `sqlite3` | 6.0.1 | Testing/local fallback |
| **Cache/Queue** | `ioredis` | ^5.10.1 | Redis client |
| | `bullmq` | ^5.78.1 | Job queues |
| **Auth** | `passport` | ^0.7.0 | Auth middleware |
| | `passport-jwt` | ^4.0.1 | JWT strategy |
| | `passport-facebook` | ^3.0.0 | Facebook OAuth |
| | `passport-google-oauth20` | ^2.0.0 | Google OAuth |
| | `argon2` | ^0.40.0 | Password hashing |
| | `bcrypt` | ^6.0.0 | Password fallback |
| **Security** | `helmet` | ^7.1.0 | Security headers |
| | `hpp` | ^0.2.3 | HTTP param pollution |
| | `mongo-sanitize` | ^1.1.0 | NoSQL injection |
| | `express-rate-limit` | ^7.1.5 | Rate limiting |
| | `cookie-parser` | ^1.4.7 | Cookie parsing |
| | `crypto-js` | ^4.2.0 | AES encryption |
| **Payments** | `stripe` | ^15.0.0 | Stripe SDK |
| | `sha.js` | ^2.4.12 | HMAC verification |
| **Real-time** | `socket.io` | ^4.7.0 | WebSocket server |
| **Monitoring** | `@sentry/node` | ^10.58.0 | Error tracking |
| | `prom-client` | ^15.0.0 | Prometheus metrics |
| **Utilities** | `class-transformer` | ^0.5.1 | DTO transformation |
| | `class-validator` | ^0.15.1 | Validation |
| | `multer` | ^2.2.0 | File upload |
| | `reflect-metadata` | ^0.2.2 | TypeScript decorators |
| | `rxjs` | ^7.8.1 | Reactive extensions |
| | `app-root-path` | ^3.1.0 | Path resolution |
| | `sql-highlight` | ^6.1.0 | SQL formatting |
| | `@sqltools/formatter` | ^1.2.5 | SQL formatting |
| | `ansis` | ^4.3.0 | ANSI colors |

---

## Backend Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/cli` | ^11.0.0 | NestJS CLI |
| `@nestjs/testing` | ^11.0.0 | Testing utilities |
| `typescript` | ^5.0.0 | TypeScript |
| `jest` | ^29.7.0 | Test runner |
| `ts-jest` | ^29.4.11 | TypeScript Jest |
| `ts-node` | ^10.9.2 | TypeScript execution |
| `@types/**` | Various | TypeScript definitions |

---

## Frontend Dependencies

### Shared Across All 4 Next.js Apps
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.5.18 | Next.js framework |
| `react` | ^19.2.7 | React UI library |
| `react-dom` | ^19.2.7 | React DOM |
| `@spicegarden/ui` | — | Shared components |
| `@tanstack/react-query` | ^5.x | Async state (super-admin) |
| `socket.io-client` | ^4.7.0 | WebSocket client |

### Per-App State Management
| App | State Libraries |
|-----|----------------|
| customer-web | `@reduxjs/toolkit` ^2.2.0, `react-redux` ^9.1.0, `@tanstack/react-query` ^5.0.0 |
| restaurant-dashboard | Redux Toolkit (placeholder), `useReducer` |
| super-admin | `@tanstack/react-query` ^5.101.0, `useReducer`, Redux (placeholder) |
| customer-mobile | None (local state + AsyncStorage) |

---

## Mobile Dependencies

### Customer Mobile + Delivery Partner
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ^56.0.12 | Expo SDK |
| `react-native` | ^0.85.3 | React Native |
| `react-native-web` | ^0.21.2 | Web rendering |
| `@react-navigation/native` | ^6.1.8 | Navigation core |
| `@react-navigation/native-stack` | ^6.9.14 | Stack navigator |
| `@react-navigation/bottom-tabs` | ^6.5.11 | Tab navigator |
| `@react-navigation/stack` | ^6.4.1 | Legacy stack |
| `expo-location` | ~56 | GPS location |
| `expo-notifications` | ~56 | Push notifications |
| `expo-haptics` | ~56 | Haptic feedback |
| `expo-constants` | ~56 | App constants |
| `expo-status-bar` | ~56 | Status bar |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistent storage |
| `react-native-gesture-handler` | ^2.24.0 | Gesture handling |
| `react-native-safe-area-context` | ^5.8.0 | Safe area |
| `react-native-screens` | ^4.11.1 | Native screens |
| `react-native-svg` | ^15.15.5 | SVG support |
| `react-native-root-toast` | ^4.0.1 | Toast notifications |
| `@spicegarden/ui` | — | Shared UI |

### Testing
| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | 29.7.0 | Test runner |
| `@testing-library/react-native` | 13.3 | RN testing |
| `typescript` | 5.9 | TypeScript |

---

## Desktop (Launcher)

| Package | Version | Purpose |
|---------|---------|---------|
| `electron` | 39-42 | Desktop framework |
| `electron-store` | — | Persistent settings |
| `electron-updater` | — | Auto-updates |
| `systeminformation` | — | System monitoring |
| `react` | — | UI rendering |
| `webpack` | — | Bundler |
| `ts-loader` | — | TypeScript loader |
| `concurrently` | — | Parallel process runner |
| `wait-on` | — | Wait for backend |

---

## Shared Packages

### @spicegarden/ui
| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | ^1.20.0 | Icon library |
| `@testing-library/jest-dom` | — | Test matchers |
| `@testing-library/react` | — | React testing |

### @spicegarden/shared
| Package | Version | Purpose |
|---------|---------|---------|
| (No runtime dependencies) | — | Pure TypeScript |

### @spicegarden/api-types
| Package | Version | Purpose |
|---------|---------|---------|
| (No runtime dependencies) | — | Pure TypeScript |

### @spicegarden/grpc-transport
| Package | Version | Purpose |
|---------|---------|---------|
| (No runtime dependencies) | — | Quarantined placeholder |

---

## Infrastructure Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | — | Containerization |
| Kubernetes | — | Orchestration |
| Prometheus | 2.51.0 | Metrics collection |
| Grafana | 10.4.0 | Dashboards |
| Alertmanager | 0.27.0 | Alert routing |
| OpenSearch | 2.15.0 | Log aggregation |
| Filebeat | — | Log shipping |
| k6 | ^0.0.0 | Load testing |
| Helm | — | K8s package management |

---

## Development Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 8-9 | Linting |
| Prettier | — | Formatting (not configured) |
| TypeScript | 5.x | Type safety |
| Jest | 29-30 | Testing |
| k6 | 0.47+ | Load testing |
| npm | 10+ | Package management |
| Playwright | (config only) | E2E (not installed) |
| chaoplay | (no config) | — |

---

## Third-Party Services

| Service | Purpose | Implementation |
|---------|---------|----------------|
| Stripe | Primary payments | `stripe` SDK v15.0.0 |
| Razorpay | INR payments | REST API + HMAC |
| Twilio | SMS | REST API |
| SendGrid | Email | SMTP + API |
| Firebase FCM | Push (Android) | REST API |
| Apple APNs | Push (iOS) | ES256 JWT |
| Google OAuth2 | Social login | Passport strategy |
| Facebook OAuth2 | Social login | Passport strategy |
| Google Maps | Maps/ETA | REST API |

---

## Known Dependency Issues

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| 31 moderate npm audit issues | Low | All in dev toolchain, 0 high/critical |
| TypeORM 1.0.0 (major) | Medium | Plan migration to v0.3.x when stable |
| Next.js 15.5.18 + React 19 | Info | Latest stable |
| socket.io 4.7.0 | Info | Stable |
| bullmq 5.78.1 | Info | Stable |
