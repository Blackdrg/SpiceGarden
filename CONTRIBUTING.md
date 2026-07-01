# Contributing to SpiceGarden

> **Feature Freeze Notice:** Per `AGENTS.md`, feature growth is frozen. Only bug fixes, reliability improvements, deployment fixes, and production hardening are permitted without explicit approval.

## 1. Development Environment Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| npm | 10.x | Package manager |
| Docker Desktop | Latest | Infrastructure |
| PostgreSQL | 16+ | Primary database |
| Redis | 7.x | Caching & queues |
| MongoDB | 7.x | Review storage |
| Git | 2.40+ | Version control |

### Initial Setup

```bash
# Clone repository
git clone https://github.com/spicegarden/spicegarden.git
cd spicegarden

# Install dependencies (all workspaces)
npm install

# Copy environment configuration
copy .env.example .env

# Generate secrets (Windows PowerShell)
powershell -File infra/scripts/generate-secrets.ps1

# Start infrastructure (Docker Desktop required)
docker-compose -f compose.dev.yaml up -d

# Verify stack is healthy
npm run verify:stack
```

### Workspace Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `npm run dev` | All workspaces | Start all frontends in dev mode |
| `npm run build` | All workspaces | Type-check and compile all packages |
| `npm run lint` | All workspaces | Run ESLint across all workspaces |
| `npm run test:unit` | All workspaces | Run unit tests |
| `npm run test:integration` | All workspaces | Run integration tests |
| `npm run test:e2e` | All workspaces | Run end-to-end tests |
| `npm run test:all` | All workspaces | Run all test suites |
| `npm run format` | All workspaces | Format code with Prettier |
| `npm run test:load` | Root | Run k6 load tests (10k users) |

### Backend-Specific Commands

```bash
cd apps/backend

# Start backend with hot reload
npm run dev

# Run tests
npm run test
npm run test:unit

# Type-check only
npx tsc --noEmit
```

---

## 2. Coding Standards

### TypeScript Configuration

- **Strict mode:** Enabled (`tsconfig.json` → `strict: true`)
- **No implicit any:** Enforced
- **No unused locals/parameters:** Enforced
- **Target:** ES2022
- **Module:** CommonJS (backend), ESNext (frontends)

### ESLint Rules

- Flat config (`eslint.config.cjs`) with recommended TypeScript rules
- NestJS plugin applied in backend workspace
- React and React Hooks plugins applied in frontend workspaces
- Zero-error policy: `npm run lint` must exit 0 before PR submission

### NestJS Backend Conventions

| Convention | Rule |
|------------|------|
| Module structure | One module per domain (feature modules) |
| Controllers | RESTful route naming, `@Controller()` prefix with version if needed |
| Services | Business logic only; no HTTP concerns |
| DTOs | Use `class-validator` decorators; `ValidationPipe` globally enabled |
| Entities | TypeORM entities in `src/db/entities/` |
| Guards | JWT + RBAC guards on protected routes |
| Exceptions | NestJS built-in `HttpException`; no custom exception classes unless shared |
| Imports | Group: Node → Third-party → Internal → Relative |
| File naming | `kebab-case` for files; `PascalCase` for classes; `camelCase` for variables |

### Next.js Frontend Conventions

| Convention | Rule |
|------------|------|
| App Router | Use `app/` directory structure |
| Pages routing | `pages/` directory for route-based files |
| Components | `PascalCase` in `components/` |
| Hooks | `use` prefix in `hooks/` |
| State management | Redux Toolkit or TanStack Query |
| Styling | Follow existing workspace conventions (CSS Modules / Tailwind as configured) |
| API calls | Use centralized API service layer; no direct `fetch` in components |

### React Native Mobile Conventions

| Convention | Rule |
|------------|------|
| Navigation | React Navigation (stack + tab navigators) |
| Screens | Functional components with hooks |
| Styling | StyleSheet API |
| Platform code | `Platform.select()` for OS-specific behavior |
| Assets | Place in `assets/` with documented naming |

---

## 3. Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `feat` | New feature | **FROZEN** — requires explicit approval |
| `fix` | Bug fix | Permitted |
| `docs` | Documentation only | Permitted |
| `style` | Formatting, missing semicolons | Permitted |
| `refactor` | Code change that neither fixes a bug nor adds a feature | Permitted |
| `perf` | Performance improvement | Permitted |
| `test` | Adding or updating tests | Permitted |
| `chore` | Build process, auxiliary tools, dependencies | Permitted |
| `security` | Security patch or vulnerability fix | Permitted |
| `revert` | Revert a previous commit | Permitted |

### Allowed Scopes

| Scope | Description |
|-------|-------------|
| `backend` | NestJS API server |
| `customer-web` | Customer-facing web application |
| `restaurant-dashboard` | Restaurant management dashboard |
| `super-admin` | Administrative dashboard |
| `customer-mobile` | Customer React Native app |
| `delivery-partner` | Delivery partner React Native app |
| `launcher` | Electron desktop launcher |
| `shared` | Shared packages (`@spicegarden/*`) |
| `infra` | Docker, Kubernetes, monitoring configs |
| `ci` | CI/CD pipeline changes |
| `deps` | Dependency updates |

### Examples

```
fix(backend): resolve rate-limiter memory leak in Redis store
security(backend): add CSRF token validation to sensitive routes
chore(deps): update uuid to resolve npm audit moderate advisory
refactor(backend): convert array syntax to object syntax for TypeORM relations
docs(ROADMAP): update Phase 2 completion status
```

---

## 4. Branch Strategy

### Branch Model

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production-ready code | Required PR, CI pass, at least 1 approval |
| `feat/*` | Feature development (approval required) | Create from `main` |
| `fix/*` | Bug fixes | Create from `main` |
| `chore/*` | Maintenance tasks | Create from `main` |

### Rules

1. All work branches off `main`
2. Branch names must follow the naming convention above
3. Never commit directly to `main`
4. Delete feature branches after merge
5. Keep branches scoped to a single concern

---

## 5. Pull Request Workflow

### Step-by-Step

1. **Create a branch** from `main`
2. **Make changes** following the coding standards above
3. **Run verification locally**:
   ```bash
   npm run lint
   npm run build
   npm run test:unit
   ```
4. **Commit** using conventional commits
5. **Push** branch to remote
6. **Open PR** against `main`
7. **CI runs** automatically:
   - Lint (all workspaces)
   - Build (all workspaces)
   - Unit tests
   - TypeScript type-check (`tsc --noEmit`)
8. **Address review feedback**
9. **Squash and merge** after approval

### PR Description Template

```markdown
## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] Security patch
- [ ] Reliability improvement
- [ ] Deployment fix
- [ ] Documentation update

## Verification
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run test:unit` passes
- [ ] Manual testing completed

## Related Issues
<!-- Link to tracking issues -->
```

### Merge Requirements

- All CI checks must pass (green)
- At least 1 approving review from a code owner
- No unresolved review comments
- Branch is up to date with `main`
- Commit message follows conventional commits format

---

## 6. Testing Requirements

### Unit Tests

- All new services, controllers, utilities, and hooks require unit tests
- Use Jest (backend) and native framework test runners (frontend)
- Coverage thresholds: **Statements ≥ 80%**, **Branches ≥ 80%**, **Functions ≥ 80%**, **Lines ≥ 80%**
- Test files co-located with source (`*.spec.ts` adjacent to `*.ts`)

### Integration Tests

- Required for all new API endpoints
- Located in `apps/backend/test/`
- Must cover success paths, validation errors, and auth edge cases

### E2E Tests

- Located in workspace-specific `e2e/` directories
- Cover critical user flows: auth, order placement, payment, delivery tracking

### Frontend Tests

- Unit tests for utility functions and hooks
- Component smoke tests for critical UI flows

---

## 7. Environment Setup Details

### Required Environment Variables

Create `.env` from `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Production | JWT signing secret |
| `ENCRYPTION_SECRET` | Production | AES encryption key |
| `DATABASE_URL` | All | PostgreSQL connection string |
| `MONGO_URI` | All | MongoDB connection string |
| `REDIS_URL` | All | Redis connection string |
| `STRIPE_SECRET_KEY` | Production | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Production | Stripe webhook verification |
| `RAZORPAY_KEY_ID` | Production | Razorpay key |
| `RAZORPAY_KEY_SECRET` | Production | Razorpay secret |
| `CORS_ALLOWED_ORIGINS` | Production | Comma-separated allowed origins |
| `SENDGRID_API_KEY` | Production | Email delivery |
| `TWILIO_ACCOUNT_SID` | Production | SMS delivery |
| `FCM_SERVER_KEY` | Production | Push notifications |

### Secrets Management

- Local development: `.env` file (gitignored)
- Production: `secrets/` directory mounted as files; env vars use `_FILE` suffix
- Never commit secrets to version control

---

## 8. Adding a New App or Package

### New Application

1. Create directory under `apps/<name>/`
2. Add `package.json` with workspace name `@spicegarden/<name>`
3. Add build, lint, and test scripts matching existing workspaces
4. Register in root `package.json` workspaces array (if outside `apps/*` glob)
5. Add to CI/CD pipeline

### New Shared Package

1. Create directory under `packages/<name>/`
2. Add `package.json` with workspace name `@spicegarden/<name>`
3. Add TypeScript config with strict mode
4. Add README with usage examples
5. Export types and utilities from `index.ts`

---

## 9. Debugging Tips

### Backend Debugging

```bash
# Debug mode with inspector
cd apps/backend
npx nest start --debug --watch

# Connect VS Code debugger (launch.json configured)
```

### Frontend Debugging

- Next.js: Use browser DevTools; React DevTools extension
- React Native: Flipper or React DevTools via Expo

### Infrastructure Debugging

```bash
# Check all services
docker-compose -f compose.dev.yaml ps

# View logs
docker-compose -f compose.dev.yaml logs -f <service>

# Reset Redis (dev only)
docker-compose -f compose.dev.yaml exec redis redis-cli FLUSHALL
```

### Common Issues

| Issue | Resolution |
|-------|-----------|
| Build fails after git pull | Run `npm install` to sync lockfile |
| Port 3001 in use | Change via `PORT` env var or kill conflicting process |
| TypeORM relations error | Use object syntax: `{ user: true }` not `['user']` |
| Next.js SWC warning | Non-blocking on Windows; WASM fallback is expected |

---

## 10. Security Considerations

- All auth endpoints are rate-limited
- Never log secrets, tokens, or PII
- Use parameterized queries (TypeORM handles this automatically)
- Validate all external input with `class-validator`
- Report security vulnerabilities privately to maintainers; do not open public issues
