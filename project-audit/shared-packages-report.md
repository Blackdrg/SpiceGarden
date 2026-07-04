# SpiceGarden Shared Packages Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of packages/ directory

## 1. Packages Directory Overview

| Package | Path | Name | Version | Status |
|---------|------|------|---------|--------|
| Shared | packages/shared | @spicegarden/shared | 0.0.0 | Partially Implemented |
| UI | packages/ui | @spicegarden/ui | 0.1.0 | Completed |
| API Types | packages/api-types | @spicegarden/api-types | 1.0.0 | Unused/Scaffold |
| Proto | packages/proto | @spicegarden/proto | 1.0.0 | Quarantined |
| gRPC Transport | packages/grpc-transport | @spicegarden/grpc-transport | 1.0.0 | Quarantined |
| UX Docs | packages/ux | - | - | Documentation Only |

## 2. @spicegarden/shared Package

### 2.1 Package Identity
- **Name**: @spicegarden/shared
- **Version**: 0.0.0
- **Private**: Yes
- **Build**: `tsc` → `./dist/`
- **Entry**: `dist/index.js`

### 2.2 Public Exports

| Sub-path | Source File | Exports |
|----------|-------------|---------|
| `.` (main) | `index.ts` | Re-exports `types`, `constants`, `api` |
| `./analytics` | `analytics.ts` | `AnalyticsEventType` (union of 15 event types), `AnalyticsEvent` interface |
| `./api` | `api.ts` | `api<T>()`, `authApi`, `restaurantsApi`, `ordersApi`, `menuApi` |
| `./constants` | `constants.ts` | `API_URL`, `SOCKET_URL` |
| `./types` | `types.ts` | `User`, `Order`, `Restaurant`, `MenuItem`, `AuthResponse`, `ApiError` |

### 2.3 Shared API Client (`api.ts`)

A shared `fetch` wrapper providing:
- **Generic `api<T>(endpoint, options)`**: Adds `Content-Type: application/json`, CSRF token support, automatic 401 → refresh-token retry flow, Bearer token support
- **`authApi`**: `login`, `register`, `refreshToken`
- **`restaurantsApi`**: `list` (with geo headers), `get`, `search`
- **`ordersApi`**: `list`, `get`, `create`, `track`
- **`menuApi`**: `list`, `categories`

**Key finding:** The `api()` function uses `process.env.NEXT_PUBLIC_API_URL` — this ties the package to Next.js and makes it unusable from non-Next.js apps (like Expo mobile). The `launcher` (Electron) also cannot use this API client.

### 2.4 Shared Type Definitions

```typescript
User: { id, fullName, email, phone, role, status, deletedAt? }
Order: { id, userId, restaurantId, status, total }
Restaurant: { id, name, description, address, latitude, longitude, rating, isActive }
MenuItem: { id, name, description, price, categoryId, isAvailable }
AuthResponse: { access_token, refresh_token, user }
ApiError: { message, statusCode }
```

### 2.5 Consumers

**Only `@spicegarden/customer-web`** imports from `@spicegarden/shared`:
- `@spicegarden/shared/api` — `api`, `authApi`, `ordersApi`, `restaurantsApi`, `menuApi`
- `@spicegarden/shared/constants` — `API_URL`, `SOCKET_URL`
- `@spicegarden/shared/analytics` — `AnalyticsEventType`, `AnalyticsEvent`

No other apps import from `@spicegarden/shared` directly (they use their own API layers or Redux).

### 2.6 Testing Coverage for `@spicegarden/shared`

Test files (2):
- `api.test.ts` — 1 test (login posts credentials with JSON content type)
- `constants.test.ts` — 1 test (env vars don't fall back to localhost)

**Very limited test coverage** — only 2 tests out of 4 source modules.

## 3. @spicegarden/ui Package

### 3.1 Package Identity
- **Name**: @spicegarden/ui
- **Version**: 0.1.0
- **Private**: Yes
- **Build**: `tsc` (compiles `.ts`/`.tsx` to `.js`/`.d.ts` in root)
- **Entry**: `index.ts` / `index.js`

### 3.2 Public Exports (index.ts)

| Export | Component/Hook/Module | File |
|--------|----------------------|------|
| `Button` | Button (primary/secondary/ghost/destructive/loading/outline, sm/md/lg, with CSS modules) | `Button.tsx`, `Button.module.css` |
| `Card` | Layout card (default/elevated/list) | `Card.tsx` |
| `Input` | Form input (forwardRef, label/error/helperText) | `Input.tsx` |
| `Skeleton` | Shimmer skeleton (text/circular/rectangular) + `SkeletonCard`, `SkeletonList` | `Skeleton.tsx` |
| `LoadingStates` | `EmptyState`, `NetworkError`, `LoadingState` (card/list/text variants) | `LoadingStates.tsx` |
| `LottieSuccessAnimation` | SVG-based success animation (named export + default) | `LottieSuccessAnimation.tsx` |
| `Toast` | `ToastProvider`, `useToast`, `InlineAlert` (react context-based) | `Toast.tsx` |
| `Modal` | `Modal` (fade/slide-up), `BottomSheet` | `Modal.tsx` |
| `SkeletonTemplates` | `ProductListSkeleton`, `MenuListSkeleton`, `CheckoutSkeleton`, `TrackingSkeleton`, `TimelineTrackingSkeleton` | `SkeletonTemplates.tsx` |
| `OTPInput` | OTP input group (4 or 6 digits, auto-advance, paste support) | `OTPInput.tsx` |
| `SearchInput` | Search input (forwardRef, onSearch on Enter) | `SearchInput.tsx` |
| `Stepper` | Quantity stepper (+/– with min/max/step) | `Stepper.tsx` |
| `analytics` | `trackEvent`, `useAnalytics`, `useWebVitals` | `analytics.ts` |
| `tokens` | `DESIGN_TOKENS`, `MOTION_EASING`, `DARK_MODE_TOKENS`, `ReducedMotionContext`, `useReducedMotion` | `tokens.ts` |
| `icons` | 18 custom domain-specific icons | `icons/index.ts` |
| `useFlow` | Multi-step flow hook (idle→success→error, tracks analytics) | `useFlow.ts` |
| `FlowManager` | Flow UI orchestrator with progress bar | `FlowManager.tsx` |
| `ErrorBoundary` | Class-based error boundary with `Card`/`Button` fallback | `ErrorBoundary.tsx` |

### 3.3 Design System / Design Tokens (`tokens.ts`)

```
DESIGN_TOKENS = {
  colors: {
    primary: '#FF5A1F', secondary: '#111827', background: '#F9FAFB',
    surface: '#FFFFFF', elevated: '#F5F5F5', textPrimary: '#111827',
    textSecondary: '#6B7280', textInverse: '#FFFFFF', success: '#10B981',
    danger: '#EF4444', warning: '#F59E0B', premium: '#D4AF37',
    border: '#E5E7EB', dangerDark: '#c62828', neutral: '#9CA3AF'
  },
  icon: { primary, secondary, muted, danger, success, warning },  // uses CSS vars
  spacing: { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 },
  typography: {
    fontFamily: 'var(--spicegarden-font-family)',
    headingXL/L/M/S, body, bodyMedium, caption, captionM, smallLabel  // sizes/weights/lineHeights
  },
  radius: { sm:4, md:8, button:12, input:14, card:24, container:28, full:9999 },
  motion: { micro:150, standard:300, page:450 },
  shadows: { small, medium, large, premiumFloat }
}

MOTION_EASING = {
  easeOutSoft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  springSmooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
}

DARK_MODE_TOKENS = { colors: {...} }  // documented but not wired to a theme provider
```

**Key finding:** Tokens are consumed as **inline-style objects** (CSS-in-JS pattern), not via CSS classes or a theme provider. There is no runtime theming—`DARK_MODE_TOKENS` is defined but unused. Dark mode is not wired.

### 3.4 UI Component Library Inventory

| Component | Variants | Accessibility |
|-----------|----------|---------------|
| `Button` | primary, secondary, ghost, destructive, loading, outline × sm/md/lg | `aria-label`, `aria-disabled`, `disabled` |
| `Card` | default, elevated, list | Semantic HTML |
| `Input` | text with label, error, helperText | `aria-invalid`, `aria-describedby` |
| `Dropdown` | select with options, disabled, placeholder | `aria-haspopup`, `aria-expanded`, `role="option"` |
| `OTPInput` | 4-digit, 6-digit with paste | `aria-label`, `aria-invalid` |
| `SearchInput` | forwarded ref, onSearch on Enter | `aria-label` |
| `Stepper` | quantity with min/max/step | `aria-label` |
| `Modal` | sm/md/lg, bottom sheet | `role="dialog"`, `aria-modal`, `aria-labelledby` |
| `Toast` | success/error/info + `InlineAlert` | `role="alert"` |
| `Skeleton` | text/circular/rectangular | `aria-hidden` implicit |
| `LoadingStates` | card/list/text + `NetworkError` | `role="status"`, `aria-live` |
| `ErrorBoundary` | class component | — |
| `Analytics` | `trackEvent`, `useAnalytics`, `useWebVitals` | — |
| `FlowManager` | step wizard + `useFlow` hook | — |
| `FoodCard` | image, price, rating, veg/non-veg, spiceLevel, offerBadge | `role="button"` |
| `MenuCard` | section/item/combo | `role="button"` (when onPress) |
| `MapCard` | ETA, rider info, progress bar | — |
| `TrackingCard` | status timeline with contact/support CTAs | — |
| `ReviewCard` | 5-star rating + textarea review | `aria-label` on stars |

**Component library type:** 100% custom. **No** Headless UI, Radix, Material-UI, Chakra, or shadcn/ui used. All components are built from scratch.

### 3.5 Storybook Configuration

**File:** `.storybook/main.ts`
- Stories path: `packages/ui/**/*.stories.@(js|jsx|ts|tsx)`
- Framework: `@storybook/react-vite`
- Addons: `@storybook/addon-essentials`, `@storybook/addon-a11y`
- Static dirs: `public`
- Identified stories (14 files):
  - `Button.stories.tsx`, `Card.stories.tsx`, `Dropdown.stories.tsx`, `Input.stories.tsx`
  - `Modal.stories.tsx`, `OTPInput.stories.tsx`, `SearchInput.stories.tsx`, `Stepper.stories.tsx`
  - `FoodCard.stories.tsx`, `MapCard.stories.tsx`, `MenuCard.stories.tsx`
  - `ReviewCard.stories.tsx`, `TrackingCard.stories.tsx`, `SkeletonTemplates.stories.tsx`

### 3.6 Motion / Animation Libraries

**No external animation library is used.** Animations are implemented via:
1. **CSS keyframes injected into `<head>` at runtime** (in `Skeleton.tsx` and `LoadingStates.tsx`):
   - `@keyframes sg-shimmer` — skeleton shimmer
   - `@keyframes pulse` — loading pulse
2. **CSS keyframes injected inline in Modal** (`fadeIn`, `slideUp`)
3. **CSS transition strings** referencing `DESIGN_TOKENS.motion.*` and `MOTION_EASING.*`
4. **`LottieSuccessAnimation`** is named "Lottie" but is actually a plain SVG — **no Lottie library dependency**

**Lottie library is NOT installed.** The component name is misleading.

### 3.7 Icon Library

**Primary library:** `lucide-react` (version `^1.17.0` in `@spicegarden/ui`, `^1.20.0` at root)

**Custom overlay icons** (18 in `packages/ui/icons/`):
- **System:** `RatingIcon`, `NotificationIcon`, `LocationIcon`
- **Navigation:** `SearchIcon`, `ProfileIcon`, `HomeIcon`
- **Kitchen:** `KitchenIcon`, `Flame` (FireIcon)
- **Delivery:** `DeliveryIcon`
- **Commerce:** `WalletIcon`, `PaymentIcon`, `OrderIcon`, `CartIcon`, `BurgerIcon`, `PizzaIcon`, `DrinkIcon`, `DessertIcon`, `HealthyIcon`
- **Admin:** `DashboardIcon`, `UsersIcon`, `ShieldIcon`

Most custom icons are thin wrappers around `lucide-react` icons (wrapping to default to `DESIGN_TOKENS.colors.primary`). Some are pure SVG (`BurgerIcon`, `PizzaIcon`, `DrinkIcon`, `DessertIcon`, `HealthyIcon`).

**Icon CSS tokens** (`icons.css`): Defines `--icon-primary`, `--icon-size-*`, `--icon-stroke` but these CSS custom properties are **not referenced anywhere** in the component code (icons use inline styles). Icons.css appears unused.

### 3.8 Consuming Applications

All apps except `launcher` and `backend` consume `@spicegarden/ui`:

| App | `@spicegarden/ui` Usage |
|---|---|
| `@spicegarden/customer-web` (Next.js, port 3002) | Heavy — imports `Button`, `Card`, `Input`, `DESIGN_TOKENS`, `SkeletonCard`, `Skeleton`, `useToast`, `ToastProvider`, `trackEvent` from ~20+ files |
| `@spicegarden/customer-mobile` (Expo) | `DESIGN_TOKENS` imported from ~12 screens/components; uses mock module declarations for UI |
| `@spicegarden/delivery-partner` (Expo) | `DESIGN_TOKENS` in `App.tsx` |
| `@spicegarden/restaurant-dashboard` (Next.js, port 3003) | `Button`, `useToast`, `ToastProvider`, `trackEvent`, `DESIGN_TOKENS` |
| `@spicegarden/super-admin` (Next.js, port 3004) | `useToast`, `DESIGN_TOKENS`, `ToastProvider`, `trackEvent` |
| `@spicegarden/launcher` (Electron) | **Does NOT use** `@spicegarden/ui` |
| `@spicegarden/backend` (NestJS) | **Does NOT use** `@spicegarden/ui` |

**Build configuration:** Next.js apps declare `transpilePackages: ['@spicegarden/ui']` (and `['@spicegarden/ui', '@spicegarden/shared']` for customer-web). Jest configs use `moduleNameMapper` to mock `@spicegarden/ui` and `lucide-react` in node_modules.

### 3.9 Testing Coverage for `@spicegarden/ui`

Test files (12):
- `Button.test.tsx` — 5 tests (render, variants, click, disabled, loading, aria)
- `Button.test.js` — additional legacy tests
- `ButtonRegression.test.tsx` — regression tests
- `Card.test.js`
- `Input.test.tsx` + `Input.test.js`
- `FlowManager.test.js` — 6 tests (mock-based)
- `useFlow.test.tsx` — 5 tests (idle, next, complete, back, fail)
- `useFlow.test.js` — legacy tests
- `LoadingStates.test.tsx`
- `Skeleton.test.js`
- `LottieSuccessAnimation.test.js`

**Missing tests:** `Dropdown`, `Modal`, `Toast`, `OTPInput`, `SearchInput`, `Stepper`, `SkeletonTemplates`, `Cards` (FoodCard/MenuCard/MapCard/TrackingCard/ReviewCard), `ErrorBoundary`, `analytics`, `useReducedMotion`, `FlowManager` (TS version missing)

### 3.10 Sentry Integration

`packages/ui/sentry.client.ts` — Exports `Sentry` initialized from `@sentry/nextjs`. This is imported in app `_app.tsx` files. Sentry is a devDependency of individual apps, **not** of the `ui` package itself.

## 4. @spicegarden/proto — gRPC Prototypes (Quarantined)

- **Name:** `@spicegarden/proto`
- **Version:** `1.0.0`
- **Purpose:** Defines gRPC constants and types (`GRPC_PORT`, `GRPC_HOST`, `GRPC_URL`, `PROTO_PACKAGE`, `ProtoDriver`, `ProtoOrder`)
- **Build:** `tsc --noEmit` (type-check only, no emit)
- **Consumers:** **Zero** — no app imports this package
- **Status:** Placeholder with no `.proto` files

## 5. @spicegarden/grpc-transport — gRPC Transport (Quarantined)

- **Name:** `@spicegarden/grpc-transport`
- **Version:** `1.0.0`
- **Description:** "Quarantined gRPC transport placeholder; production flows use REST/WebSocket APIs"
- **Exports:** `GrpcTransportUnavailableError`, `createGrpcTransport()` (throws), `grpcTransportStatus`
- **Consumers:** **Zero** — never imported anywhere
- **Status:** Explicitly quarantined

## 6. @spicegarden/api-types — Delivery Partner Types

- **Name:** `@spicegarden/api-types`
- **Version:** `1.0.0`
- **Exports:** `DriverProfile`, `DeliveryOrder`, `EarningsSummary`, `Location`
- **Consumers:** **Zero** — no app imports this package (the delivery-partner app defines its own types)
- **Status:** Standalone definitions, not referenced

**Key finding:** `proto/constants.ts` and `api-types/index.ts` both define `DeliveryOrder`/`ProtoOrder` with identical structures — **duplicated type definitions**.

## 7. `packages/ux` — UX Documentation Only

Contains 12 markdown files (Phase 1 deliverables):
- Design system tokens, spacing, typography, radius, shadows
- Motion design system (timings, easings, Lottie recipe specs)
- Screen architecture for all 4 apps
- Component library spec (14 mandatory components)
- Developer handoff checklist
- **No executable code** — pure documentation

## 8. Dependency Graph Summary

```
@spicegarden/ui  ←── customer-web, customer-mobile, delivery-partner,
                    restaurant-dashboard, super-admin

@spicegarden/shared  ←── customer-web only

@spicegarden/proto  ←── no consumers

@spicegarden/grpc-transport  ←── no consumers

@spicegarden/api-types  ←── no consumers
```

### 8.1 Cross-Package Import Patterns

- **`@spicegarden/ui` → no internal package imports** (fully self-contained except for `lucide-react`)
- **`@spicegarden/shared` → no internal package imports** (self-contained)
- **No cross-package imports between `@spicegarden/ui` and `@spicegarden/shared`** — they are independent despite both being foundational
- **`@spicegarden/shared/analytics.ts`** and **`@spicegarden/ui/analytics.ts`** define overlapping event types independently — **no shared interface**

### 8.2 Internal Usage Patterns

- **CSS-in-JS via inline styles** — All `@spicegarden/ui` components apply `DESIGN_TOKENS` as inline `style` objects. No CSS modules except `Button.module.css` (which also hardcodes colors, not referencing tokens). `icons.css` exists but is unused.
- **`lucide-react`** is used by both the icon system (some icons wrap lucide) and directly in `FlowManager.tsx` (`CheckCircle`, `AlertCircle`)
- **Sentry** is initialized in the `ui` package but is an app-level dependency
- **React Context** is used for `Toast` (ToastContext) and `ReducedMotion` tokens — but no provider wrappers are exported beyond `ToastProvider`

## 9. Identified Issues / Gaps

| # | Issue | Severity | Location |
|---|---|---|---|
| 1 | **Type divergence**: `AnalyticsEventType` defined independently in both `shared/analytics.ts` and `ui/analytics.ts` with different event sets | High | `packages/shared/analytics.ts`, `packages/ui/analytics.ts` |
| 2 | **Duplicate types**: `ProtoOrder` (proto) and `DeliveryOrder` (api-types) are identical copies | Medium | `packages/proto/src/constants.ts`, `packages/api-types/src/index.ts` |
| 3 | **CSS token mismatch**: `icons.css` defines `--icon-primary: theme('colors.primary')` (Tailwind syntax) but project has no Tailwind | Low | `packages/ui/icons.css` |
| 4 | **Unused CSS**: `icons.css` is never imported; `Button.module.css` hardcodes colors instead of referencing `DESIGN_TOKENS` | Low | `packages/ui/icons.css`, `packages/ui/Button.module.css` |
| 5 | **Misleading name**: `LottieSuccessAnimation` is plain SVG, not Lottie. No `lottie-react` dependency exists | Low | `packages/ui/LottieSuccessAnimation.tsx` |
| 6 | **Dark mode unused**: `DARK_MODE_TOKENS` and `ReducedMotionContext` are defined but never wired to a theme provider or used at runtime | Low | `packages/ui/tokens.ts` |
| 7 | **Nexus-only API client**: `@spicegarden/shared/api.ts` uses `NEXT_PUBLIC_API_URL`, making it unusable from Expo/Electron | High | `packages/shared/api.ts` |
| 8 | **Orphan packages**: `@spicegarden/proto`, `@spicegarden/grpc-transport`, `@spicegarden/api-types` have zero importers | Medium | All three packages |
| 9 | **Limited test coverage**: `shared` has 2 tests; `ui` has 12 test files but many components untested | Medium | `packages/shared/__tests__/`, `packages/ui/__tests__/` |
| 10 | **Mixed test formats**: Duplicate `.test.js`/`.test.tsx` files co-exist for Button, FlowManager, Input, useFlow | Low | `packages/ui/__tests__/` |

## 10. Evidence References

**Package structure:**
- `C:\Users\mehta\Desktop\SpiceGarden\packages\` — 6 directories: `api-types/`, `grpc-transport/`, `proto/`, `shared/`, `ui/`, `ux/`

**UI package:**
- `packages/ui/package.json` — public API with `exports` field
- `packages/ui/index.ts` — barrel file exporting 19 modules
- `packages/ui/tokens.ts` — design tokens, `MOTION_EASING`, `DARK_MODE_TOKENS`, `ReducedMotionContext`
- `packages/ui/Button.mocule.css` — CSS modules with hardcoded colors
- `packages/ui/icons.css` — CSS vars with Tailwind `theme()` syntax (unused)
- `packages/ui/icons/index.ts` — 18 custom icon wrappers
- `packages/ui/analytics.ts` — duplicate event type definitions vs shared
- `packages/ui/sentry.client.ts` — app-level Sentry init
- `.storybook/main.ts` — Storybook config targeting `packages/ui/**/*.stories.*`
- 14 `*.stories.tsx` files in `packages/ui/`

**Shared package:**
- `packages/shared/package.json` — `exports` field with `./analytics`, `./api`, `./constants`, `./types`
- `packages/shared/api.ts` — fetch wrapper with auth refresh and CSRF
- `packages/shared/analytics.ts` — 15-event-type union
- `packages/shared/constants.ts` — `API_URL`, `SOCKET_URL`
- `packages/shared/types.ts` — `User`, `Order`, `Restaurant`, `MenuItem`, `AuthResponse`, `ApiError`

**Quarantined packages:**
- `packages/grpc-transport/src/index.ts` — throws `GrpcTransportUnavailableError`
- `packages/proto/src/constants.ts` — duplicated `ProtoOrder` type
- `packages/api-types/src/index.ts` — duplicated `DeliveryOrder` type

**Consumer apps:**
- `apps/customer-web/package.json` — depends on `@spicegarden/ui`, transpiles it
- `apps/customer-mobile/package.json` — depends on `@spicegarden/ui`
- `apps/delivery-partner/package.json` — depends on `@spicegarden/ui`
- `apps/restaurant-dashboard/package.json` — depends on `@spicegarden/ui`
- `apps/super-admin/package.json` — depends on `@spicegarden/ui`
- `apps/launcher/package.json` — no `@spicegarden/*` dependencies
- `apps/backend/package.json` — no `@spicegarden/*` dependencies

**Cross-package import evidence (86 matches):**
- `grep @spicegarden/ui` in apps → 86 matches across customer-web, customer-mobile, delivery-partner, restaurant-dashboard, super-admin
- `grep @spicegarden/shared` in apps → 17 matches, all in `customer-web` only
- `grep @spicegarden/proto|api-types|grpc-transport` in apps → 0 matches