# SPICEGARDEN AUTHENTICATION & AUTHORIZATION QUALIFICATION
**Release Baseline:** `v1.0.0-rc1` | **Date:** 2026-10-02T19:04:22.383Z

## 1. Role-Based Access Control (RBAC) Matrix

| Role | Target Applications | Allowed Operations | Forbidden Operations | Security Enforcement | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer** | `customer-web`, `customer-mobile` | Browse menu, Cart, Checkout, Live Tracking, Profile, Addresses, Wallet | Kitchen actions, Fleet dispatch, Admin stats, User management | JWT `role: "customer"`, Route Guards | **PASS** |
| **Restaurant** | `restaurant-dashboard` (KDS) | View branch orders, Accept order, Update prep status, Mark ready, Inventory toggle | Access other branch data, Dispatch driver, Modify ledger | JWT `role: "restaurant"`, Branch Tenant Guard | **PASS** |
| **Driver** | `delivery-partner` | Toggle shift online/offline, Accept assigned order, Submit location, Verify OTP | Direct database modifications, Customer PII export, Modify menu | JWT `role: "driver"`, Rider Shift Guard | **PASS** |
| **Admin** | `super-admin` | Support tickets, Branch monitor, Order cancellations, Driver roster | Super-admin root secrets, Vault master keys, Direct DB wipe | JWT `role: "admin"`, Admin Route Middleware | **PASS** |
| **Super-Admin**| `super-admin` | Full platform analytics, Financial ledger audits, Fraud rule config | Exceed rate limits without token, Bypass audit log | JWT `role: "super-admin"`, MFA + Audit Logging | **PASS** |

## 2. Horizontal & Vertical Privilege Boundary Validation
- **Horizontal Access (User A vs User B):** Validated that Customer A with valid JWT cannot access `/orders/:id` or `/users/addresses` belonging to Customer B. Response: `403 Forbidden` / `404 Not Found`. **Result: PASS**.
- **Vertical Escalation:** Customer attempting to call `/admin/stats` or `/kitchen/orders`. Response: `403 Forbidden`. **Result: PASS**.
- **Token Invalidation:** Revoking session in Redis/Postgres instantly denies token refresh. **Result: PASS**.
