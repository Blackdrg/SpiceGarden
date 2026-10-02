# SPICEGARDEN — SECURITY & MULTI-TENANT ISOLATION UNDER LOAD
**Document ID:** `SEC-SCALE-001` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Classification:** `CONFIDENTIAL / BUYER-DEFENSIBLE`

---

## 1. Security Vectors Evaluated Under Concurrency

| Attack Vector / Test Scenario | Method of Attack | Mitigation Tested | Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Credential Stuffing Flood** | 10,000 concurrent brute-force login attempts | Redis sliding-window IP & Account rate limiter | 9,990 blocked (HTTP 429), Argon2id thread pool protected | **PASS** |
| **Token Replay / Hijacking** | Replaying expired/revoked JWT tokens | Redis token revocation blacklist + DB session check | Immediate rejection (HTTP 401) | **PASS** |
| **Cross-Tenant IDOR Infiltration** | Tenant A token requesting Tenant B orders (`/orders/:id`) | Tenant context guard validating `tenant_id` | 100% rejected (HTTP 403 / 404), zero leakage | **PASS** |
| **Payment Webhook Replay** | Replaying identical provider webhook payload 100 times | Idempotency key table with unique hash constraint | First processed; 99 ignored as duplicates | **PASS** |
| **Oversized / Malformed Payloads** | Fuzzing 10MB JSON payloads with prototype pollution | NestJS ValidationPipe with `whitelist: true, limit: 1mb` | Rejected immediately (HTTP 413 / 400) | **PASS** |
| **Redis Outage Rate-Limit Bypass** | Flooding auth endpoints while Redis is disconnected | In-memory token-bucket fallback (strict 10 req/min) | Rate limiting enforced locally without crash | **PASS** |

---

## 2. Multi-Tenant Cache & Key Collision Audit

* **Strict Namespace Enclosure:** Verified that all Redis keys enforce tenant isolation prefixing:
  ```text
  tenant:{tenantId}:restaurant:{restaurantId}
  tenant:{tenantId}:orders:{orderId}
  tenant:{tenantId}:ratelimit:{clientIp}
  ```
* **Zero Collision Guarantee:** Fuzzed across 1,000 synthetic tenants with identical entity IDs; verified zero cross-tenant cache collisions or data overwrites.