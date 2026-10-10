# README

# SpiceGarden

Production-grade food delivery platform built with NestJS, Next.js, React Native, and Electron.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer / Ingress                  │
│                    (Nginx + Envoy + CDN)                     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ customer-web │   │   restaurant  │   │   super-admin│
│   :3002      │   │  dashboard   │   │    :3004     │
│  Next.js 15  │   │   :3003      │   │  Next.js 15  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   customer   │   │   restaurant  │   │   super-admin│
│   mobile     │   │   dashboard   │   │  dashboard   │
│  (Expo 56)   │   │  (Expo 56)   │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Gateway                        │
│                 @spicegarden/backend (NestJS)                 │
│                          :3001                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │  Orders  │ │Payments  │ │Kitchen   │      │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Delivery │ │  Wallet  │ │ Refund   │ │ Loyalty  │      │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │   MongoDB    │   │     Redis    │
│    16        │   │      7       │   │      7       │
│  (TypeORM)   │   │  (Mongoose)  │   │  (BullMQ)    │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Tech Stack

### Backend
- **Framework**: NestJS 11.1
- **Runtime**: Node.js ES2022
- **ORM**: TypeORM 0.2 + Mongoose 9.7
- **Queue**: BullMQ 5.78 + Redis
- **Realtime**: Socket.IO 4.7
- **Auth**: Passport JWT + Google OAuth + Facebook OAuth
- **Payments**: Stripe 15 + Razorpay
- **Security**: Helmet, CSRF, CORS, Rate Limiting, AES-256-GCM
- **Monitoring**: Prometheus + Grafana + Sentry

### Frontend
- **Web**: Next.js 15.5.19 (Pages Router)
- **State**: Redux Toolkit + TanStack Query v5
- **Mobile**: Expo SDK 56 (React Native 0.85)
- **Desktop**: Electron 39 + Webpack 5
- **UI**: Custom design system (@spicegarden/ui) + Lucide icons
- **Styling**: CSS Modules

### Infrastructure
- **Containerization**: Docker multi-stage
- **Orchestration**: Docker Compose (dev) + Kubernetes (prod)
- **Databases**: PostgreSQL 16, MongoDB 7, Redis 7
- **Logging**: Filebeat → OpenSearch
- **CI/CD**: GitHub Actions

## Monorepo Structure

```
spicegarden/
├── apps/
│   ├── backend/              # NestJS API (port 3001)
│   ├── customer-web/         # Next.js (port 3002)
│   ├── customer-mobile/      # Expo (port -)
│   ├── restaurant-dashboard/ # Next.js (port 3003)
│   ├── super-admin/          # Next.js (port 3004)
│   ├── delivery-partner/     # Expo
│   └── launcher/             # Electron desktop
├── packages/
│   ├── shared/               # @spicegarden/shared
│   ├── ui/                   # @spicegarden/ui
│   ├── api-types/            # @spicegarden/api-types (unused)
│   ├── proto/                # @spicegarden/proto (quarantined)
│   └── grpc-transport/       # @spicegarden/grpc-transport (quarantined)
├── infra/
│   ├── postgres/
│   ├── k8s/
│   ├── load-tests/
│   └── scripts/
└── docs/
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop
- PostgreSQL 16
- Redis 7

### Installation

```bash
# Clone repository
git clone <repo-url> spicegarden
cd spicegarden

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start infrastructure
docker-compose -f compose.dev.yaml up -d

# Run database migrations
cd apps/backend
npm run migration:run

# Seed database (optional)
npm run seed

# Start development
npm run dev
```

### Environment Variables

See `.env.example`, `.env.staging.example`, `.env.production.example`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run unit tests |
| `npm run test:unit` | Run unit tests across all workspaces |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:load` | Run k6 load tests |
| `npm run test:chaos` | Run chaos experiments |
| `npm run verify:stack` | Verify all services are running |

## API Endpoints

Base URL: `http://localhost:3001`

### Authentication
- `POST /auth/login` - Email/password login
- `POST /auth/register` - Customer registration
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Revoke session
- `GET /auth/me` - Get current user
- `GET /auth/google` - Google OAuth
- `GET /auth/facebook` - Facebook OAuth

### Orders
- `POST /orders` - Place order
- `GET /orders/:id` - Get order details
- `GET /orders/health` - Health check

### Restaurants
- `GET /restaurants` - List restaurants
- `GET /restaurants/search` - Search restaurants
- `GET /restaurants/nearby` - Find nearby restaurants
- `GET /restaurants/:slug` - Get restaurant details

### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/refund` - Refund payment
- `GET /payments/gateways` - List gateways
- `POST /payments/webhook` - Stripe/Razorpay webhooks

### Wallet
- `GET /wallet` - Get wallet
- `POST /wallet/credit` - Credit wallet
- `POST /wallet/debit` - Debit wallet
- `POST /wallet/cod/process` - Process COD payment

### Admin
- `GET /admin/dashboard` - Dashboard stats
- `GET /admin/orders` - Get orders
- `POST /admin/users/ban` - Ban user

## Testing

```bash
# Run all unit tests
npm run test:unit

# Run backend tests
cd apps/backend && npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run load tests
npm run test:load
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Docker
```bash
# Build all images
docker-compose -f compose.prod.yaml build

# Deploy
docker-compose -f compose.prod.yaml up -d
```

### Kubernetes
```bash
# Deploy to staging
kubectl apply -f infra/k8s/staging.yaml

# Deploy to production
kubectl apply -f infra/k8s/production-hardened.yaml
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Security](./docs/SECURITY.md)
- [Testing](./docs/TESTING.md)
- [Technical Debt](./docs/TECHNICAL_DEBT.md)

## License

MIT