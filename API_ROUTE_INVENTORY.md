# API_ROUTE_INVENTORY

Generated: 2026-06-18 18:12 IST

## Source of truth

Scanned controllers under `apps/backend/src/**/*.ts`.

## Verified live routes

Current backend process started with `npm --workspace @spicegarden/backend run dev`. This uses `LocalDevModule`, so only health routes are live.

| Endpoint | Method | Live result | PASS/FAIL |
|---|---|---|---|
| `/health` | GET | HTTP 200 | PASS |
| `/auth/register` | GET probe | HTTP 404 because LocalDevModule does not mount AuthController | FAIL for live API |
| `/restaurants` | GET probe | HTTP 404 because LocalDevModule does not mount RestaurantController | FAIL for live API |
| `/orders` | GET probe | HTTP 404 because LocalDevModule does not mount OrderController | FAIL for live API |

Full backend route availability cannot be verified without PostgreSQL, MongoDB, and Redis because Docker and local services are unavailable.

## Actual controller routes found

| Endpoint | Method | Controller | Auth | Notes |
|---|---|---|---|---|
| `/` | GET | `AppController` | No | Root health |
| `/health` | GET | `AppController` | No | Backend health |
| `/metrics` | GET | `MetricsController` | No | Prometheus metrics endpoint |
| `/auth/login` | POST | `AuthController` | No | Returns `access_token` and `refresh_token` from `AuthService.login()` |
| `/auth/register` | POST | `AuthController` | No | Creates user, then calls `AuthService.login()` |
| `/orders` | POST | `OrderController` | JWT, roles `CUSTOMER`, `ADMIN`, `SUPER_ADMIN` | Creates order |
| `/orders/health` | GET | `OrderController` | No | Order service health |
| `/restaurants` | GET | `RestaurantController` | No | Lists active restaurants |
| `/restaurants/search` | GET | `RestaurantController` | No | Search restaurants |
| `/restaurants/nearby` | GET | `RestaurantController` | No | Nearby branches |
| `/restaurants/:slug` | GET | `RestaurantController` | No | Restaurant details |
| `/user/addresses` | GET | `UserProfileController` | JWT | User address list |
| `/user/addresses` | POST | `UserProfileController` | JWT | Create address |
| `/user/addresses/:id` | PUT | `UserProfileController` | JWT | Update address |
| `/user/addresses/:id` | DELETE | `UserProfileController` | JWT | Delete address |
| `/user/payment-methods` | GET | `UserProfileController` | JWT | Payment methods |
| `/user/payment-methods` | POST | `UserProfileController` | JWT | Create payment method |
| `/user/payment-methods/:id/set-default` | PUT | `UserProfileController` | JWT | Set default payment method |
| `/payments/create-intent` | POST | `PaymentsController` | JWT, roles `CUSTOMER`, `ADMIN`, `SUPER_ADMIN` | Payment intent |
| `/payments/gateways` | GET | `PaymentsController` | JWT, roles | Payment gateways |
| `/payments/gateway/config` | GET | `PaymentsController` | JWT, roles | Gateway config |

## Routes requested by existing k6 scripts

| k6 route | Actual route | Result | Required fix |
|---|---|---|---|
| `POST /auth/signup` | `POST /auth/register` | Invalid | Use `/auth/register` |
| `POST /auth/register` | `POST /auth/register` | Valid in full app | Use real JWT from response/login |
| `POST /auth/login` | `POST /auth/login` | Valid in full app | Use returned `access_token` |
| `POST /orders` | `POST /orders` | Valid in full app | Use JWT and valid payload |
| `GET /orders/health` | `GET /orders/health` | Valid in full app | Keep |
| `GET /restaurants` | `GET /restaurants` | Valid in full app | Keep |
| `GET /orders/history` | Not found | Invalid | Remove or replace with existing order endpoint if added later |
| `GET /restaurants/:id/menu` | Not found in `RestaurantController`; menu may exist under restaurant details | Invalid for current controller | Use `/restaurants/:slug` or add explicit menu route later |
| `POST /cart` | No cart controller found | Missing | Do not call; no cart API exists |
| `GET /users/profile` | No such route; actual user routes are `/user/...` | Invalid | Use `/user/addresses` or `/user/payment-methods` if needed |
| `POST /payments/intent` | `POST /payments/create-intent` | Invalid | Use `/payments/create-intent` only if payment flow is in scope |

## k6 payload corrections

| Area | Existing issue | Correct payload |
|---|---|---|
| Register | Some scripts use `/auth/signup` or omit `phone` | `POST /auth/register` with `email`, `password`, `fullName`, `phone` |
| Login | Some scripts do not capture token | Capture `body.access_token` |
| Orders | Some scripts use `itemId` instead of `id` | `items: [{ id, name, price, quantity }]` |
| Orders | Some scripts omit `userId` | Include `userId` from JWT payload `sub` |
| Orders | Some scripts omit `deliveryAddressId` | Include `deliveryAddressId` |
| Orders | Totals sometimes mismatch | `grandTotal === subtotal + tax + deliveryFee - discount + tip` |

## Authentication flow

- `POST /auth/register` source returns `{ access_token, refresh_token }`.
- `POST /auth/login` source returns `{ access_token, refresh_token }`.
- No HTTP refresh endpoint exists in scanned controllers.
- `JwtStrategy` validates `Authorization: Bearer <token>`.
- `OrderController`, `UserProfileController`, and `PaymentsController` require JWT.
