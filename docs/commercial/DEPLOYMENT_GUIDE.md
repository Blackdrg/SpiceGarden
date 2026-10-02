# SpiceGarden — Deployment Guide

## 1. Prerequisites
- Node.js >= v20.x (v25.x verified)
- PostgreSQL >= 15.x
- Redis >= 7.x
- MongoDB >= 6.x
- npm >= 9.x

## 2. Environment Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Prepare environment variables:
   - Copy `.env.example` to `.env` for the backend root.
   - For web frontends, ensure `.env.production.local` or `.env.staging.local` is present in:
     - `apps/customer-web/`
     - `apps/restaurant-dashboard/`
     - `apps/super-admin/`
3. Validate environment configuration consistency:
   ```bash
   node infra/scripts/validate-env-consistency.js
   ```

## 3. Database Migration & Initialization
1. Execute database migrations using TypeORM:
   ```bash
   cd apps/backend && npm run migration:run
   ```
2. (Optional) Run initial local database seeding:
   ```bash
   cd apps/backend && npm run seed
   ```

## 4. Production Build Process
Execute the monorepo build across all 12 workspaces:
```bash
npm run build
```

## 5. Kubernetes & Container Deployment
- Production manifests: [`infra/k8s/production-hardened.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/production-hardened.yaml)
- Ingress & CDN manifests: [`infra/k8s/cdn-ingress.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/cdn-ingress.yaml)
- Apply to target Kubernetes cluster:
  ```bash
  kubectl apply -f infra/k8s/production-hardened.yaml
  kubectl apply -f infra/k8s/cdn-ingress.yaml
  ```

## 6. Health & Readiness Verification
- API Health Check: `GET /health`
- Liveness Probe: `GET /health/liveness`
- Readiness Probe: `GET /health/readiness`
- Metrics: `GET /metrics`
