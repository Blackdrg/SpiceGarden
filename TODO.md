# SpiceGarden React Doctor — Resumé State

**Date:** 2026-06-14 (Day 8 — session cut short)  
**Baseline:** 270 issues (-47% from 509 start)  
**Progress today:** Stable. No net change in issue count.

---

## ✅ Verified Working Changes (do NOT revert)

### customer-web
- `nextjs-no-img-element` FIXED: `<img>` → `<Image>` in `profile.tsx`, `order-details.tsx` (2 locations)
- `nextjs-no-client-side-redirect` PARTIAL: ProtectedRoute `useEffect` removed; inline `router.push('/auth')` removed from `addresses.tsx`
- Broken import in `order-details.tsx` FIXED: duplicate `Button, Card, DESIGN_TOKENS` line removed

### delivery-partner  
- `mounted` state crash FIXED in `ShiftManagementScreen.tsx` — added `useState(false)` + `useEffect(() => setMounted(true), [])`

### customer-mobile
- `.gitignore` has `.expo/` entry

---

## ⚠️ Known Issues (DO NOT TOUCH without review)

### 1. ProtectedRoute — needs cleanup
**File:** `apps/customer-web/src/components/ProtectedRoute.tsx`  
**State:** Partially refactored. `useEffect` removed, `useRouter` removed. Just a sync token check now.  
**Remaining pages with old `router.push('/auth')` inline:** `addresses.tsx` (1 fixed, 1 more), `notifications.tsx` (2), `payment-methods.tsx` (2), `order-details.tsx` (1), `auth/callback.tsx` (1)  
**Action:** Replace inline `router.push('/auth')` with synchronous return (ProtectedRoute handles it). ~30 min.

### 2. React Query prototype — dead code
**File:** `apps/customer-web/src/hooks/useAddresses.ts`  
**State:** Written but NOT wired into `addresses.tsx`. `API_URL` is at bottom of file (wrong order, will cause ReferenceError).  
**Action:** Either delete this file, or move `API_URL` to top and wire into page. Not urgent.

### 3. delivery-partner DeliveriesScreen — `no-event-handler` flags are FALSE POSITIVES
**Lines:** 93 (`acceptOrder`), 106 (`rejectOrder`)  
**Reason:** Both are `useCallback` with `[]` deps — properly memoized, not inline event handlers.  
**Action:** No fix needed.

### 4. customer-web `order-details.tsx` status — VERIFIED OK
**State:** `STATUS_LABELS` and `STATUS_COLORS` lifted to module scope, synchronous references only.  
**Action:** None.

---

## 📋 Next Session — Ordered Work (highest ROI first)

### Batch A — Finish `nextjs-no-client-side-redirect` (9 → 0 in customer-web) (~20 min)

Files needing inline `router.push('/auth')` removed:
1. `addresses.tsx` — 1 more at line 48 (401 check)
2. `notifications.tsx` — lines 37, 47
3. `payment-methods.tsx` — lines 38, 48
4. `order-details.tsx` — line 73
5. `auth/callback.tsx` — line 30

Pattern: Replace `router.push('/auth')` + `return` with just `return`. ProtectedRoute handles auth gating.

### Batch B — `nextjs-no-img-element` in super-admin/restaurant-dashboard (~10 min)
- `super-admin/src/pages/profile.tsx` — line 135
- `restaurant-dashboard/src/pages/index.tsx` — line 163

### Batch C — `prefer-module-scope-*` lifts in source files (~30 min)
- `customer-mobile/src/screens/ProfileScreen.tsx` — `menuItems` at line 176 → lift to top
- `customer-mobile/src/screens/OnboardingScreen.tsx` — `onboardingSlides` at line 35
- `delivery-partner/App.tsx` — `statusLabel` at line 308

### Batch D — `no-inline-exhaustive-style` low-risk extractions (~1 hr)
Focus on customer-web with 8-12 props:
1. `OfflineIndicator.tsx` / `.js` — 12 props
2. `AdminDashboard` header — 12 props (restaurant-dashboard)
3. `auth.tsx` — 8 props, 9 props

---

## 🚫 Do NOT Touch Without Design Review
- `rn-prefer-reanimated` (17 files) — needs `react-native-reanimated` install + Babel plugin
- `prefer-useReducer` (12) — needs state-model decisions per component
- `no-fetch-in-effect` (7) — needs data layer (React Query/SWR) decision
- `nextjs-no-client-side-redirect` (7) — architectural, needs auth flow review
- `no-vulnerable-react-server-components` (5) — Next.js upgrade (package.json changes)

---

## Commands to Resume

```powershell
# Check current modified files
cd C:\Users\mehta\Desktop\SpiceGarden
git diff --name-only

# Run fresh scan
npx react-doctor@latest -y --json 2>&1 | Out-File -Encoding utf8 _scan.json
```
