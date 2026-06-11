# API Versioning Strategy

## Overview

The SpiceGarden API follows a **URL-based versioning strategy** with semantic versioning principles. This ensures backward compatibility, clear upgrade paths, and enterprise-grade API stability.

## Versioning Scheme

```
v{MAJOR}.{MINOR}.{PATCH}
```

- **MAJOR**: Breaking changes requiring client updates
- **MINOR**: Backward-compatible feature additions
- **PATCH**: Backward-compatible bug fixes

## URL Structure

```
https://api.spicegarden.com/v1/resource
https://api.spicegarden.com/v2/resource
```

All endpoints are versioned at the URL level. The current stable version is **v1**.

## Implementation

### NestJS Implementation (`main.ts`)

```typescript
// API versioning is configured globally
app.setGlobalPrefix('api/v1', {
  exclude: ['health', 'metrics'],
});

// Optional: Double version protection via headers
app.use((req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  res.setHeader('API-Version', '1.0.0');
  res.setHeader('API-Deprecated', version === 'v1' ? 'false' : 'true');
  next();
});
```

## Version Lifecycle

| Phase | Timeline | Support Status |
|-------|----------|----------------|
| **Current** | Active | Full support |
| **Deprecated** | 6 months notice | Bug fixes only |
| **EOL** | End of Life | No support |

## Deprecation Policy

### Deprecation Headers

```http
API-Deprecated: true
API-Sunset: Wed, 01 Oct 2025 00:00:00 GMT
Warning: 299 - "This API version will be deprecated on 2025-10-01"
```

### Deprecation Process

1. **6 months advance notice** via headers and documentation
2. **Migration guide** published with new version
3. **Monitoring** of deprecated endpoint usage
4. **Graceful deprecation** with sunset date

## Current API Endpoints (v1)

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - Logout

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/{id}` - Get order details
- `PATCH /api/v1/orders/{id}/status` - Update order status
- `POST /api/v1/orders/{id}/cancel` - Cancel order

### Payments
- `POST /api/v1/payments/intents` - Create payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/refund` - Process refund
- `POST /api/v1/webhook/stripe` - Stripe webhooks

### Drivers
- `GET /api/v1/drivers/available` - Get available drivers
- `POST /api/v1/drivers/{id}/accept` - Accept assignment
- `POST /api/v1/drivers/{id}/location` - Update location
- `POST /api/v1/drivers/{id}/status` - Update status

### Wallet
- `GET /api/v1/wallet` - Get wallet balance
- `POST /api/v1/wallet/credit` - Credit wallet
- `POST /api/v1/wallet/debit` - Debit wallet
- `GET /api/v1/wallet/transactions` - Transaction history

### Restaurants
- `GET /api/v1/restaurants` - List restaurants
- `GET /api/v1/restaurants/{id}` - Restaurant details
- `GET /api/v1/restaurants/{id}/menu` - Menu items

## Backward Compatibility Guarantees

1. **Field additions**: New optional fields never break existing clients
2. **Endpoint additions**: New endpoints don't affect existing ones
3. **Deprecated fields**: Maintained for 2 major versions
4. **Breaking changes**: Only with new major version

## Version Detection

### Client-Side Version Detection

```javascript
// Fetch available API versions
const versions = await fetch('/api/versions');
// Returns: { v1: 'stable', v2: 'beta', latest: 'v1' }
```

### Server-Side Version Header

```typescript
// Returns current API version
// GET /api/versions
{
  "versions": {
    "v1": { "status": "stable", "releaseDate": "2024-01-01" },
    "v2": { "status": "deprecated", "sunsetDate": "2025-10-01" }
  },
  "latest": "v1"
}
```

## Migration Examples

### v1 to v2 (Future)

```diff
# v1
- GET /api/v1/restaurants?limit=10

# v2 (with cursor-based pagination)
+ GET /api/v2/restaurants?cursor=abc123&direction=next
```

## Monitoring and Metrics

- API version usage tracked via Prometheus metrics
- Deprecation warnings logged via structured logging
- Migration adoption rate monitored

## Contact

For API questions: api@spicegarden.com
Documentation: https://docs.spicegarden.com/api