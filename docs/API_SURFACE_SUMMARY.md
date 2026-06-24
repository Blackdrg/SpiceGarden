# API Surface Summary

**Date:** 2026-06-23

---

## Controllers (41 total)

**Source:** `apps/backend/src/**/*controller.ts`

### Auth & Users
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| auth.controller.ts | /auth/login, /auth/signup, /auth/otp | 2 suites |
| user.controller.ts | /users/* | Tests present |
| session.controller.ts | /session/* | Tests present |
| profile.controller.ts | /profile/* | Tests present |

### Restaurant & Menu
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| restaurant.controller.ts | /restaurants, /restaurants/:id | Tests present |
| menu.controller.ts | /menu, /menu/:id | Tests present |
| category.controller.ts | /categories | Tests present |

### Orders & Cart
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| order.controller.ts | /orders, /orders/:id | 2 suites |
| cart.controller.ts | /cart/* | Tests present |
| checkout.controller.ts | /checkout/* | Tests present |

### Payments
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| payments.controller.ts | /payments/* | 4 suites |
| webhook.controller.ts | /webhook/* | Tests present |
| refund.controller.ts | /refund/* | 1 suite |

### Delivery
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| delivery.controller.ts | /delivery/* | 2 suites |
| driver-assignment.controller.ts | /assign/* | Tests present |

### Notifications
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| notification.controller.ts | /notifications/* | Tests present |

### Wallet & Ledger
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| wallet.controller.ts | /wallet/* | 1 suite |
| ledger.controller.ts | /ledger/* | Tests present |

### GST & Tax
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| gst.controller.ts | /gst/* | Tests present |

### Analytics & Admin
| Controller | Routes | Tests |
| ---------- | ------ | ----- |
| analytics.controller.ts | /analytics/* | Tests present |
| admin.controller.ts | /admin/* | Tests present |

---

## API Endpoints (selected)

| Path | Method | Purpose | Status |
| ---- | ------ | ------- | ------ |
| /health | GET | Health check | Implemented |
| /metrics | GET | Prometheus metrics | Implemented |
| /auth/login | POST | User login | Implemented |
| /auth/signup | POST | User registration | Implemented |
| /auth/otp | POST | OTP login | Implemented |
| /restaurants | GET | List restaurants | Implemented |
| /menu | GET | Menu items | Implemented |
| /orders | POST | Create order | Implemented |
| /orders/:id | GET/PUT | Get/update order | Implemented |
| /payments | POST | Process payment | Implemented |
| /webhook/stripe | POST | Stripe webhook | Implemented |
| /webhook/razorpay | POST | Razorpay webhook | Implemented |
| /wallet | GET | Get wallet balance | Implemented |
| /wallet/credit | POST | Credit wallet | Implemented |
| /admin/* | GET/POST | Admin endpoints | Implemented |
| /tracking | WS | Order tracking | Implemented |

---

## WebSocket Events

**Source:** `apps/backend/src/infra/tracking/tracking.gateway.ts`

| Event | Direction | Purpose |
| ----- | --------- | ------- |
| driverOnline | Client → Server | Driver available |
| driverOffline | Client → Server | Driver unavailable |
| updateLocation | Client → Server | Location streaming |
| orderAssigned | Server → Client | New order alert |
| etaUpdate | Server → Client | ETA changes |
| deliveryStatusUpdate | Client → Server | Status updates |