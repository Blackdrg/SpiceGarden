# Deep-Link Audit

**Status:** DRAFT — First draft, not yet reviewed by product/engineering.  
**Last audited:** 2026-08-02

---

## 1. Overview

This document audits all deep links configured across SpiceGarden mobile applications. Deep links enable navigation from external sources (emails, SMS, push notifications, web links) directly to specific screens within the mobile apps.

## 2. Customer Mobile App (`customer-mobile`)

**Config file:** `apps/customer-mobile/app.config.js:88-110`  
**Bundle ID:** `com.spicegarden.customer`

### Configured Deep Link Schemes

| Scheme | Path | Target | Status | Code Reference |
|---|---|---|---|---|
| `spicegarden://` | `pay` | Payment flow screen | **NOT IMPLEMENTED** — handler only logs | `App.tsx:120-128` |
| `spicegarden-cash://` | `cod` | COD confirmation screen | **NOT IMPLEMENTED** — handler only logs | `App.tsx:124-128` |
| `https://spicegarden.com/link` | Any (universal links) | Dynamic routing via `Linking` | **CONFIGURED** — universal links | `app.config.js:105` |

### Deep-Link Handler

```typescript
// App.tsx:120-129 — Current implementation (STUB)
const handleDeepLink = (event: { url: string }) => {
  const { host, path, scheme } = Linking.parse(event.url);
  console.log('Deep link received:', scheme, host, path);

  if (host === 'pay') {
    console.log('Navigating to payment flow from deep link');
  } else if (host === 'cod') {
    console.log('Navigating to COD confirmation from deep link');
  }
};
```

**Gap:** The deep-link handler does not actually navigate to any screen. It only logs to the console. Both `spicegarden://pay` and `spicegarden-cash://cod` are detected but no navigation occurs.

### Intent Filters (Android)

```json
{
  "action": "VIEW",
  "data": [
    { "scheme": "spicegarden", "host": "pay" },
    { "scheme": "spicegarden-cash", "host": "cod" }
  ],
  "categories": ["BROWSABLE", "DEFAULT"]
}
```

**Config:** `app.config.js:93-101`

### iOS Universal Links

- Associated domains: `https://spicegarden.com/link` (`app.config.js:105`)
- Requires Apple App Site Association (AASA) file at `https://spicegarden.com/.well-known/apple-app-site-association`

**Status:** `ENGINEERABLE NOW` — The AASA file and navigation logic need to be implemented for deep links to function on iOS.

## 3. Delivery Partner App (`delivery-partner`)

**Config file:** `apps/delivery-partner/app.config.js:67-86`  
**Bundle ID:** `com.spicegarden.driver`

### Configured Deep Link Schemes

| Scheme | Path | Target | Status | Code Reference |
|---|---|---|---|---|
| `spicegarden-driver://` | `order` | Order assignment screen | **NOT IMPLEMENTED** — no handler found | `app.config.js:76` |
| `https://spicegarden.com/driver-link` | Any (universal links) | Dynamic routing | **CONFIGURED** — universal links | `app.config.js:83` |

### Deep-Link Handler

The delivery-partner app does not have an explicit deep-link handler in `App.tsx`. Deep links are configured in `app.config.js` but no handler exists to process them.

**Gap:** No deep-link handler implementation. The `spicegarden-driver://order` scheme is registered in the Android manifest but not processed by the app.

**Status:** `ENGINEERABLE NOW` — Add a deep-link handler in `App.tsx` similar to the customer app.

### Intent Filters (Android)

```json
{
  "action": "VIEW",
  "data": [
    { "scheme": "spicegarden-driver", "host": "order" }
  ],
  "categories": ["BROWSABLE", "DEFAULT"]
}
```

**Config:** `app.config.js:72-79`

### iOS Universal Links

- Associated domains: `https://spicegarden.com/driver-link` (`app.config.js:83`)
- Requires AASA file at `https://spicegarden.com/.well-known/apple-app-site-association`

## 4. Web Apps

Web applications use standard HTTP/HTTPS URLs with Next.js routing. No custom URL schemes are used.

| App | URL | Routing | Code Reference |
|---|---|---|---|
| customer-web | `https://spicegarden.com/...` | Next.js pages | `pages/_app.tsx` |
| restaurant-dashboard | `https://restaurant.spicegarden.com/...` | Next.js pages | `pages/_app.tsx` |
| super-admin | `https://admin.spicegarden.com/...` | Next.js pages | `pages/_app.tsx` |

## 5. Deep-Link Usage

### Customer App Uses
| Use Case | Source | Deep Link |
|---|---|---|
| Payment completion | Push notification / email | `spicegarden://pay?orderId=xxx` |
| COD confirmation | In-app notification | `spicegarden-cash://cod?orderId=xxx` |
| Order tracking | Email | `https://spicegarden.com/link/order/xxx` |

### Driver App Uses
| Use Case | Source | Deep Link |
|---|---|---|
| New order assignment | Push notification | `spicegarden-driver://order?id=xxx` |

## 6. Recommendations

1. **Implement navigation handlers** for `spicegarden://pay`, `spicegarden-cash://cod`, and `spicegarden-driver://order` in their respective `App.tsx` files.
2. **Configure AASA file** at `https://spicegarden.com/.well-known/apple-app-site-association` for iOS universal links.
3. **Add deep-link analytics** to track link click-through and conversion rates.
4. **Test all deep links** with both cold-start and warm-start app states.

## 7. CDN Ingress Mapping

Deep links and universal links are served via the CDN ingress, which routes:
- `spicegarden.com` → `spicegarden-static` service (static assets + web app)
- `api.spicegarden.com` → `spicegarden-backend` service (API)
- `restaurant.spicegarden.com` → `spicegarden-static` service (restaurant dashboard)
- `admin.spicegarden.com` → `spicegarden-static` service (super-admin)

**Config:** `infra/k8s/cdn-ingress.yaml:22-70`

---

*This document is a DRAFT. For deep-link questions, contact mobile@spicegarden.com.*
