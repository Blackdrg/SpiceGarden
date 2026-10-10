# SpiceGarden Performance Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of build outputs, source code, and configuration files

## 1. Build Performance

### 1.1 Build Times (from project-audit/logs/build.log)

| Workspace | Build Command | Time | Status |
|-----------|--------------|------|--------|
| @spicegarden/backend | `tsc -p tsconfig.build.json` | ~5s | ✅ PASS |
| @spicegarden/customer-web | `next build` | ~11s | ✅ PASS |
| @spicegarden/restaurant-dashboard | `next build` | ~6s | ✅ PASS |
| @spicegarden/super-admin | `next build` | ~7s | ✅ PASS |
| spicegarden-launcher | `tsc + webpack` | ~15s | ✅ PASS |
| Other packages | `tsc --noEmit` | ~1-2s each | ✅ PASS |

**Total monorepo build time: ~45s**

### 1.2 Bundle Sizes

#### Customer Web (Next.js)
| Metric | Value |
|--------|-------|
| First Load JS (shared) | 287 kB |
| Framework JS | 59.6 kB |
| Main bundle | 35.6 kB |
| _app bundle | 189 kB |
| Largest page | /tracking (302 kB) |
| Smallest page | /cart (287 kB) |

#### Restaurant Dashboard (Next.js)
| Metric | Value |
|--------|-------|
| First Load JS (shared) | 333 kB |
| Framework JS | 59.6 kB |
| Main bundle | 35.4 kB |
| _app bundle | 236 kB |

#### Super Admin (Next.js)
| Metric | Value |
|--------|-------|
| First Load JS (shared) | 335 kB |
| Framework JS | 59.6 kB |
| Main bundle | 35.4 kB |
| _app bundle | 238 kB |

#### Launcher (Electron)
| Metric | Value |
|--------|-------|
| Renderer bundle | 195 kB (minified) |

## 2. Frontend Performance

### 2.1 React Doctor Scores (from project-audit/logs/react-doctor.log)

| App | Score | Warnings |
|------|-------|----------|
| @spicegarden/customer-web | 95/100 | 1 (fetch in useEffect) |
| @spicegarden/restaurant-dashboard | 95/100 | 1 (unused recharts) |
| @spicegarden/super-admin | 73/100 | 1 (large component, fetch in useEffect) |
| @spicegarden/delivery-partner | 89/100 | 2 (large component, unused recharts) |

**Overall React health: GOOD (average 88/100)**

### 2.2 Performance Patterns

| Pattern | Status | Evidence |
|---------|--------|----------|
| React Query caching | ✅ Implemented | customer-web, restaurant-dashboard, super-admin |
| Skeleton loaders | ✅ Implemented | @spicegarden/ui Skeleton component |
| CSS Modules | ✅ Implemented | All Next.js apps use CSS Modules |
| Compression middleware | ✅ Implemented | backend main.ts:227 |
| Image optimization | ⚠️ Partial | Next.js Image used but not optimized |
| Lazy loading | ⚠️ Partial | No route-level code splitting |
| Service Worker | ❌ Missing | No PWA/service worker |
| Bundle analysis | ❌ Missing | No bundle analyzer configured |

## 3. Backend Performance

### 3.1 Middleware Stack (from main.ts)

| Middleware | Purpose | Performance Impact |
|-----------|---------|-------------------|
| Helmet | Security headers | Minimal |
| CORS | Origin validation | Minimal |
| CSRF | Token validation | Minimal |
| Mongo Sanitize | Input sanitization | Minimal |
| HPP | Parameter pollution prevention | Minimal |
| Compression | gzip/brotli | Positive (reduces response size) |
| Rate Limiting | Request throttling | Minimal (Redis-backed) |
| Request Timeout | 30s default | Prevents hung connections |
| Body Size Limit | 10kb default | Prevents large payloads |

### 3.2 Database Performance

| Aspect | Current | Assessment |
|--------|---------|------------|
| Connection pool | 20 (configurable) | Adequate for dev |
| Query optimization | N+1 risks in OrderService | Needs review |
| Indexes | 15+ on core entities | Good base coverage |
| Missing indexes | Composite indexes on OrderEntity | Medium risk |
| Connection pooling | No PgBouncer | Acceptable for current scale |
| Migration strategy | TypeORM migrations | Good |

### 3.3 Caching

| Cache Layer | Status | Evidence |
|-------------|--------|----------|
| Redis (rate limiting) | ✅ Implemented | redis-rate-limit.store.ts |
| Redis (queue) | ✅ Implemented | BullMQ with ioredis |
| Redis (sessions) | ⚠️ Partial | Session caching in VaultService |
| HTTP cache headers | ❌ Missing | No Cache-Control on responses |
| Application cache | ⚠️ Partial | React Query only |

## 4. Network Performance

| Aspect | Status | Evidence |
|---------|--------|----------|
| HTTP/2 | ✅ Enabled (via NestJS/Express) | Default in Node 22+ |
| Compression | ✅ gzip/brotli | main.ts:227 |
| Connection keep-alive | ✅ Enabled | data-source.ts keepAlive: true |
| WebSocket | ✅ Socket.IO 4.7 | tracking.gateway.ts |
| WebSocket buffer | 1024 bytes max | tracking.gateway.ts maxHttpBufferSize |

## 5. Mobile Performance

| Aspect | Status | Evidence |
|---------|--------|----------|
| FlatList usage | ✅ Implemented | customer-mobile HomeScreen |
| AsyncStorage caching | ✅ Implemented | Order cache with 5min TTL |
| Pull-to-refresh | ✅ Implemented | HomeScreen pattern |
| Pagination | ⚠️ Partial | Not clearly implemented |
| Image optimization | ❌ Missing | No expo-image or similar |
| Bundle splitting | ⚠️ Partial | Metro bundler default |

## 6. Performance Gaps

| Gap | Severity | Impact | Effort |
|-----|----------|--------|--------|
| N+1 queries in OrderService | HIGH | Slow order listing | Medium |
| Missing composite indexes | MEDIUM | Slow filtered queries | Low |
| No service worker/PWA | MEDIUM | Poor offline experience | High |
| No bundle analyzer | LOW | Unknown bundle composition | Low |
| No lazy route loading | LOW | Larger initial bundles | Low |
| No HTTP cache headers | MEDIUM | Unnecessary re-fetching | Low |
| Image optimization not explicit | LOW | Larger payloads | Low |
| No CDN for static assets | MEDIUM | Higher latency | Medium |

## 7. Performance Recommendations

| Priority | Recommendation | Expected Impact |
|----------|---------------|-----------------|
| P1 | Add composite indexes on OrderEntity | 30-50% faster order queries |
| P1 | Fix N+1 queries in OrderService | 50-80% faster order listing |
| P1 | Add Cache-Control headers | Reduced server load |
| P2 | Implement service worker for offline | Better mobile UX |
| P2 | Add CDN for static assets | 20-40% faster asset delivery |
| P3 | Configure bundle analyzer | Visibility into bundle |
| P3 | Implement lazy route loading | 10-20% smaller initial bundle |