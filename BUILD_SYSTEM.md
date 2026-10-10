# Build System Reference

## Overview

SpiceGarden uses npm workspaces with a root-level orchestration layer. Each workspace builds independently but shares the root node_modules.

**Source:** Root and workspace `package.json`, `tsconfig.json`, Dockerfiles

---

## Monorepo Structure

### Workspace Configuration

**Root `package.json` workspaces:**
- `apps/*` - 7 applications
- `packages/*` - 5 shared packages

### Build Pipeline

```
npm run build (root)
├── builds all workspaces in dependency order
├── shared packages first (ui, shared, api-types, proto)
└── apps second (backend, customer-web, etc.)
```

---

## Root npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run --workspaces dev` | Start all workspaces in dev mode |
| `build` | `npm run --workspaces build` | Build all packages |
| `lint` | `npm run --workspaces lint` | Lint all packages |
| `test` | `npm run test:unit` | Run unit tests |
| `test:unit` | `npm run --workspaces --if-present test:unit` | Unit tests |
| `test:integration` | `npm run --workspaces --if-present test:integration` | Integration tests |
| `test:e2e` | `npm run --workspaces --if-present test:e2e` | E2E tests |
| `test:all` | `npm run --workspaces --if-present test:all` | All tests |
| `format` | `npm run --workspaces format` | Format all |
| `verify:stack` | `node infra/scripts/verify-stack.js` | Verify Docker stack |
| `dev:local` | `run.cmd` | Start local dev (Windows) |
| `local:full` | `run.cmd --full` | Full local dev with all services |
| `local:infra` | `run.cmd --infra` | Infrastructure only |

---

## TypeScript Configuration

### Root tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "references": [
    { "path": "./apps/backend" },
    { "path": "./apps/customer-web" },
    { "path": "./apps/restaurant-dashboard" },
    { "path": "./apps/super-admin" },
    { "path": "./apps/customer-mobile" },
    { "path": "./apps/delivery-partner" },
    { "path": "./packages/ui" },
    { "path": "./packages/shared" },
    { "path": "./packages/api-types" },
    { "path": "./packages/proto" },
    { "path": "./packages/grpc-transport" }
  ]
}
```

### Project References

TypeScript project references enable:
- Incremental builds
- Cross-package type checking
- Correct build order

---

## Backend Build (NestJS)

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
# Output: dist/src/main.js

# Test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:cov
```

### NestJS Configuration

- **Framework:** NestJS 11.1.27
- **Compiler:** TypeScript 5.x with tsconfig
- **Output:** `dist/src/main.js`
- **Module System:** CommonJS

---

## Frontend Builds (Next.js)

### Build Commands

```bash
npm run build
# Output: .next/ (standalone mode enabled)
# Start: node server.js
```

### Next.js Configuration Pattern

All three Next.js apps (`customer-web`, `restaurant-dashboard`, `super-admin`) share:

```javascript
{
  transpilePackages: ['@spicegarden/ui', '@spicegarden/shared'],
  experimental: {
    externalDir: true,
    turbo: { resolveAlias: { ... } }
  },
  eslint: { ignoreDuringBuilds: true }
}
```

### Standalone Output

```
.next/
├── standalone/
│   └── server.js  # Entry point
├── static/
│   └── [hash]/    # Static assets
└── server/
    └── pages/     # Server-side bundles
```

---

## Mobile Builds (Expo)

### Customer Mobile

```bash
npx expo start
# Development: Expo Go app
# Production: EAS Build → .apk/.ipa
```

**Configuration:**
- SDK: Expo 56
- React Native: 0.85
- Output: `dist/` for production
- Bundler: Metro (HMR enabled)

### Delivery Partner

```bash
expo start
# Same pattern as customer-mobile
```

---

## Desktop Build (Electron)

### Launcher Build

```bash
npm run build
# Output: dist/
npm run package
# Creates installer via electron-builder
```

### Electron Builder Config

- **Platforms:** Windows (NSIS installer)
- **Arch:** x64
- **Output:** `release/` directory

---

## Docker Build Strategy

### Multi-Stage Pattern

All services use identical multi-stage Dockerfile:

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
```

### Services & Entry Points

| Service | Workspace | Port | Entry Point |
|---------|-----------|------|-------------|
| Backend | `@spicegarden/backend` | 3001 | `node dist/src/main.js` |
| Customer Web | `@spicegarden/customer-web` | 3000 | `node server.js` |
| Restaurant Dashboard | `@spicegarden/restaurant-dashboard` | 3000 | `node server.js` |
| Super Admin | `@spicegarden/super-admin` | 3000 | `node server.js` |
| Delivery Partner | `@spicegarden/delivery-partner` | 3000 | `node dist/server.js` |

### Docker Security

- `read_only` root filesystem
- `no_new_privileges`
- tmpfs for `/tmp`
- Resource limits per service

---

## Linting Configuration

### ESLint

- **Config:** Workspace-level `.eslintrc.*`
- **Strict Mode:** Enabled in TypeScript configs
- **CI Gate:** `npm run lint` fails build
- **Ignore During Builds:** `eslint.ignoreDuringBuilds: true` (Next.js)

### Prettier (if configured)

- Used via `npm run format`

---

## Test Configuration

### Unit Tests

- **Framework:** Jest (implied by test scripts)
- **Coverage Target:** 80%+ branches, functions, lines, statements
- **Threshold:** Enforced in CI

### Integration Tests

- Run against live infrastructure
- Require Docker Compose stack

### E2E Tests

- Contract tests for API
- Run in CI after build

---

## Build Artifacts

| Workspace | Build Output | Size Target |
|-----------|--------------|-------------|
| Backend | `dist/src/main.js` | <50MB |
| Customer Web | `.next/standalone/` | <100MB |
| Restaurant Dashboard | `.next/standalone/` | <100MB |
| Super Admin | `.next/standalone/` | <100MB |
| Customer Mobile | `dist/` | <50MB |
| Delivery Partner | `dist/` | <50MB |
| Launcher | `release/` | <200MB |

---

## Incremental Build

TypeScript project references enable incremental builds:
```
tsc --build          # Incremental
tsc --build --clean  # Clean
tsc --build --force  # Force rebuild
```

---

## Known Build Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| socket.io forced upgrade | FIXED | Override in root package.json |
| multer version pin | FIXED | Pinned to 2.2.0 |
| Next.js transpilePackages | CONFIGURED | ui, shared packages |
