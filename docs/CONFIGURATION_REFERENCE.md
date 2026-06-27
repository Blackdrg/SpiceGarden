# Configuration Reference

## Root Configuration Files

### package.json (Root Workspace)

**Workspaces:**
```
"workspaces": [
  "apps/*",
  "packages/*"
]
```

**Root Scripts:**

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `npm run --workspaces dev` | Start all workspaces in dev mode |
| `build` | `npm run --workspaces build` | Build all packages |
| `lint` | `npm run --workspaces lint` | Lint all workspaces |
| `test` | `npm run test:unit` | Run unit tests |
| `test:unit` | `npm run --workspaces --if-present test:unit` | Unit tests across workspaces |
| `test:integration` | `npm run --workspaces --if-present test:integration` | Integration tests |
| `test:e2e` | `npm run --workspaces --if-present test:e2e` | E2E tests |
| `test:all` | `npm run --workspaces --if-present test:all` | All tests combined |
| `verify:stack` | `node infra/scripts/verify-stack.js` | Verify infrastructure stack |
| `dev:local` | `run.cmd` | Start local dev environment |
| `dev:local:full` | `run.cmd --full` | Full local dev |
| `dev:local:infra` | `run.cmd --infra` | Infrastructure only |
| `dev:local:check` | `run.cmd --check` | Check environment |
| `dev:local:stop` | `stop.cmd` | Stop local dev |

### tsconfig.json (Root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "noEmit": true,
    "incremental": true,
    "composite": true
  },
  "include": [],
  "references": [
    { "path": "./apps/backend" },
    { "path": "./apps/customer-web" },
    { "path": "./apps/restaurant-dashboard" },
    { "path": "./apps/super-admin" },
    { "path": "./apps/delivery-partner" },
    { "path": "./apps/customer-mobile" },
    { "path": "./packages/shared" },
    { "path": "./packages/ui" },
    { "path": "./packages/api-types" },
    { "path": "./packages/proto" },
    { "path": "./packages/grpc-transport" }
  ]
}
```

### compose.dev.yaml

**13 Services:**
- postgres:16-alpine (5432)
- redis:7-alpine (6379)
- mongo:7 (27017)
- prom/prometheus:v2.51.0 (9090)
- grafana/grafana-enterprise:10.4.0 (3000)
- opensearchproject/opensearch:2.15.0 (9200, 9300)
- opensearchproject/opensearch-dashboards:2.15.0 (5601)
- prom/alertmanager:v0.27.0 (9093)
- backend (multi-stage build, 3001)
- customer-web (multi-stage build, 3002)
- restaurant-dashboard (multi-stage build, 3003)
- super-admin (multi-stage build, 3004)
- delivery-partner (multi-stage build, 3005)

## Backend Configuration

### App Module

**ConfigSource:** `apps/backend/src/app.module.ts`
- ConfigModule with global scope
- envFilePath: `../../.env` and `.env` (relative to backend working directory)

### Environment Variables

#### Required (Production)

| Variable | Purpose | Format | Example |
|----------|---------|--------|---------|
| `NODE_ENV` | Environment | `development` \| `production` \| `staging` | `production` |
| `PORT` | Backend port | Number | `3001` |
| `DB_HOST` | PostgreSQL host | String | `localhost` |
| `DB_PORT` | PostgreSQL port | Number | `5432` |
| `DB_USER` | PostgreSQL username | String | `spicegarden` |
| `DB_PASS` | PostgreSQL password | String | `****` |
| `DB_NAME` | PostgreSQL database | String | `spicegarden` |
| `MONGO_URI` | MongoDB connection string | URI | `mongodb://mongo:27017/spicegarden` |
| `REDIS_HOST` | Redis host | String | `localhost` |
| `REDIS_PORT` | Redis port | Number | `6379` |
| `REDIS_URL` | Redis full URL | URI | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | String (32+ chars) | `****` |
| `JWT_EXPIRES_IN` | JWT token expiration | String | `7d` |
| `ENCRYPTION_SECRET` | AES-256 encryption key | String (32 chars) | `****` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins | String | `https://app.spicegarden.com` |

#### Payment Gateway

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |
| `PAYMENT_PRIMARY_GATEWAY` | Default gateway (`stripe` or `razorpay`) |

#### Communication

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | SMTP server host |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From email address |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging key |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `SENDGRID_API_KEY` | SendGrid API key |

#### Rate Limiting

| Variable | Purpose | Default |
|----------|---------|---------|
| `RATE_LIMIT_REDIS_REQUIRED` | Require Redis for rate limiting | `true` |
| `REDIS_RATE_LIMIT_URL` | Redis URL for rate limiting | Fallback to REDIS_URL or REDIS_HOST:REDIS_PORT |
| `RATE_LIMIT_AUTH_OTP_WINDOW_MS` | OTP rate limit window | 600000 (10min) |
| `RATE_LIMIT_AUTH_OTP_MAX` | OTP max attempts | 3 |
| `RATE_LIMIT_AUTH_WINDOW_MS` | Auth rate limit window | 900000 (15min) |
| `RATE_LIMIT_AUTH_MAX` | Auth max attempts | 5 |
| `RATE_LIMIT_ORDERS_WINDOW_MS` | Orders rate limit window | 900000 (15min) |
| `RATE_LIMIT_ORDERS_MAX` | Orders max attempts | 10 |
| `RATE_LIMIT_API_WINDOW_MS` | General API rate limit window | 900000 (15min) |
| `RATE_LIMIT_API_MAX` | General API max attempts | 100 |

#### WebSocket

| Variable | Purpose | Default |
|----------|---------|---------|
| `WS_MAX_HTTP_BUFFER_SIZE` | Max WebSocket message size | 1024 |
| `WS_RATE_LIMIT_MAX` | Max connection attempts per window | 10 |
| `WS_RATE_LIMIT_WINDOW_MS` | Connection rate limit window | 60000 |
| `WS_ACK_TIMEOUT_MS` | Message acknowledgement timeout | 5000 |

#### Queue

| Variable | Purpose | Default |
|----------|---------|---------|
| `QUEUE_CONCURRENCY` | BullMQ worker concurrency | 5 |

#### Trust Proxy

| Variable | Purpose |
|----------|---------|
| `TRUST_PROXY` | Enable trust proxy (required behind load balancer) |

#### Observability

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Sentry error tracking DSN |
| `LOAD_TEST_MODE` | Disable rate limiting during load tests |

#### Body Size

| Variable | Purpose | Default |
|----------|---------|---------|
| `BODY_SIZE_LIMIT` | JSON/URL-encoded body size limit | `10kb` |

### Throttler Configuration

**File:** `apps/backend/src/security/security.module.ts`

```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,  // 1 minute window
  limit: process.env.LOAD_TEST_MODE === 'true' && process.env.NODE_ENV !== 'production' 
    ? 1000000  // Unlimited during load tests
    : 10,       // 10 requests per minute default
}])
```

### Rate Limiter Configuration

**File:** `apps/backend/src/main.ts`

| Route Pattern | Namespace | Max | Window |
|---------------|-----------|-----|--------|
| `/auth/otp` | AUTH_OTP | 3 | 10 min |
| `/auth/` | AUTH | 5 | 15 min |
| `/orders` | ORDERS | 10 | 15 min |
| `/api/` | API | 100 | 15 min |

## Frontend Configuration

### Customer Web

**Port:** 3002
**Framework:** Next.js 15.5.18

**Next.js Config:**
- `transpilePackages`: ['@spicegarden/ui', '@spicegarden/shared']
- React StrictMode enabled
- Sentry integration
- Analytics instrumentation

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

### Restaurant Dashboard

**Port:** 3003
**Framework:** Next.js 15.5.18

**Next.js Config:**
- `transpilePackages`: ['@spicegarden/ui']
- Sentry integration

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Super Admin

**Port:** 3004
**Framework:** Next.js 15.5.18

**Next.js Config:**
- `transpilePackages`: ['@spicegarden/ui']
- Sentry integration

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Customer Mobile

**Framework:** Expo 56.0.12 / React Native 0.85
**Key Config Files:**
- `app.config.js` - Expo app configuration
- `babel.config.js` - Babel config
- `metro.config.js` - Metro bundler config
- `tsconfig.json` - TypeScript config

**Environment Variables:** Runtime config only (no build-time env)

### Delivery Partner

**Framework:** Expo 56.0 / React Native 0.85
**Key Config Files:**
- `app.config.js`
- `babel.config.js`
- `metro.config.js`
- `tsconfig.json`

### Launcher

**Port:** N/A (Electron)
**Framework:** Electron 39.8

**Webpack Configs:**
- `webpack.main.config.js` - Main process build
- `webpack.renderer.config.js` - Renderer process build
- `webpack.preload.config.js` - Preload script build

**Config Files:**
- `tsconfig.json`
- `tsconfig.main.json`
- `tsconfig.renderer.json`
- `tsconfig.test.json`

## CI/CD Configuration

### GitHub Actions Workflows

**ci-cd.yml:**
- Triggers: push to main/develop, PR to main, daily security audit (cron 0 2 * * *)
- Jobs:
  - `security-audit`: npm audit --audit-level=high, Snyk
  - `build-test`: lint, unit tests, coverage gate, integration tests, contract tests, build, quick load check, Docker build/push
  - `deploy-staging`: auto-deploy to staging on develop branch
  - `deploy-production`: auto-deploy to production on main branch

**react-doctor.yml:**
- React Doctor quality checks for all frontend workspaces

**rollback.yml:**
- Rollback procedure for failed deployments

### Docker Configuration

**Multi-stage builds** for all containerized apps:
- `infra/backend/Dockerfile`
- `infra/customer-web/Dockerfile`
- `infra/restaurant-dashboard/Dockerfile`
- `infra/super-admin/Dockerfile`
- `infra/delivery-partner/Dockerfile`

**Security Features:**
- `read_only: true`
- `security_opt: no-new-privileges:true`
- Resource limits (CPU, memory)
- Health checks
- Tmpfs for /tmp

## Overrides & Pinning

**Root package.json overrides:**

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

Known vulnerability in socket.io 4.8.3 is present but contained.
