# Frontend Status Report

Generated: 2026-06-17T21:30+05:30  
Evidence: frontend route/screen inventories, representative source files, React Doctor JSON files, build/lint/test output.

## Frontend Inventory

| App | Routes/Screens | State/services evidence | Tests | Notes |
| :--- | ---: | :--- | ---: | :--- |
| Customer web | 24 pages | 10 hooks, API services, wallet/auth/order/payment services | 3 | Real routes for addresses, auth, cart, checkout, history, menu, order details, payment methods, profile, restaurant, search, subscriptions, tracking, wallet |
| Customer mobile | 15 screens | 2 hooks, API services, Socket.IO tracking | 11 | Some screens are placeholders, including order details and tracking |
| Delivery partner | 12 screens | 1 hook, API services | 3 | Screens use mock data in deliveries and earnings |
| Restaurant dashboard | 11 pages | API services, Socket.IO, dashboard state | 3 | Uses demo data and Socket.IO |
| Super admin | 15 pages | API services, Socket.IO, admin state | 4 | Uses API base from `NEXT_PUBLIC_API_URL` or localhost fallback |

## Route and Screen Coverage

- Customer web has 24 tracked page files.
- Customer mobile has 15 tracked screen files.
- Delivery partner has 12 tracked screen files.
- Restaurant dashboard has 11 tracked page files.
- Super admin has 15 tracked page files.

## Placeholder and Demo-Data Evidence

| App | File | Evidence |
| :--- | :--- | :--- |
| Customer mobile | `apps/customer-mobile/src/screens/OrderDetailsScreen.tsx` | Displays `Order Details placeholder` |
| Customer mobile | `apps/customer-mobile/src/screens/TrackingScreen.tsx` | Displays `Tracking screen placeholder` |
| Delivery partner | `apps/delivery-partner/src/screens/DeliveriesScreen.tsx` | Uses mock delivery list |
| Delivery partner | `apps/delivery-partner/src/screens/EarningsScreen.tsx` | Uses mock earnings summary |
| Restaurant dashboard | `apps/restaurant-dashboard/src/pages/index.tsx` | Uses pre-seeded demo data and Socket.IO |
| Super admin | `apps/super-admin/src/pages/index.tsx` | Uses Socket.IO and API base fallback |

## React Doctor Evidence

| App | Evidence file | Errors | Warnings |
| :--- | :--- | ---: | ---: |
| Customer web | `react-doctor-web.json` | 5 | 147 |
| Customer mobile | `react-doctor-mobile.json` | 1 | 109 |
| Restaurant dashboard | `react-doctor-restaurant.json` | 1 | 32 |
| Super admin | `react-doctor-admin.json` | 1 | 47 |
| Current aggregate | `react-doctor-current.json` | 11 | 480 |
| Older report | `reports/audit/react-doctor.json` | 0 | 62 |

## React Doctor Output Evidence

- `react-doctor-output.txt` scanned 247 files in 44.8s.
- Warnings include missing effect dependencies and time/random values in JSX.

## Frontend Readiness

- Customer web has the broadest route coverage.
- Customer mobile and delivery partner contain placeholder/mock-data screens.
- Restaurant dashboard and super admin have operational dashboards but React Doctor warnings remain.
- Build and lint passed for all packages in this session.
