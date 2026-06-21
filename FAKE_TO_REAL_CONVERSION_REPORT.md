# Fake to Real Conversion Report

## Conversions Completed (2026-06-20)

### Category A — Fixed

| Module | File | Status |
|--------|------|--------|
| Restaurant Display | `apps/customer-web/src/pages/restaurant.tsx` | ✅ Fixed - Now fetches real menu via `/business/restaurants/:id/menu` |
| Restaurant Dashboard | `apps/restaurant-dashboard/src/pages/index.tsx` | ✅ Fixed - Now fetches real orders/inventory via `/kitchen/orders` and `/kitchen/inventory` |
| Admin Dashboard | `apps/super-admin/src/components/types.ts` | ✅ Fixed - Removed fake static stats |
| Admin Service | `apps/backend/src/services/admin/admin.service.ts` | ✅ Fixed - Now returns real branches from DB |
| API Service | `apps/backend/src/apis.service.ts` | ✅ Fixed - Now returns real menu data from RestaurantService |

### Category B — Already Isolated

| Module | File | Status |
|--------|------|--------|
| Local Dev Mode | `apps/backend/src/main.ts` | ✅ Correctly isolates to dev mode |
| In-memory Review | `apps/backend/src/db/db.module.ts` | ✅ Correctly isolated |

### Category C — N/A

No dead code found.

---

## Backend Changes Made

### `apps/backend/src/modules/kitchen/kitchen.controller.ts`
Added endpoints:
- `GET /kitchen/orders` - Fetch orders for kitchen display
- `GET /kitchen/inventory` - Fetch inventory for restaurant

### `apps/backend/src/modules/kitchen/kitchen.service.ts`
Added methods:
- `getKitchenOrders(status?, restaurantId?)` - Fetch orders with branch/restaurant data
- `getKitchenInventory(branchId?)` - Fetch inventory items

### `apps/backend/src/apis.service.ts`
Enhanced:
- `getMenu(menuId)` - Now returns real menu items from PostgreSQL

### `apps/backend/src/apis.module.ts`
Updated:
- Added `ConfigModule` and `RestaurantServiceModule` imports

---

## Frontend Changes Made

### `apps/customer-web/src/pages/restaurant.tsx`
- Replaced hardcoded `menuItems` with API call
- Replaced hardcoded `categories` with derived categories
- Added error handling and loading states

### `apps/restaurant-dashboard/src/pages/index.tsx`
- Removed `DEMO_ITEMS` and `seedInventory` arrays
- Added `fetchKitchenOrders()` and `fetchKitchenInventory()` functions
- Initial state now fetches from API
- Removed `demoOrder()` function

### `apps/super-admin/src/components/types.ts`
- Changed `initialAdminDashboardState()` to use zeros instead of fake data