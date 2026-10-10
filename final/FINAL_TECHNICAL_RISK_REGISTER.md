# SpiceGarden v1.0.0-rc1 — Final Technical Risk Register

**Release**: `v1.0.0-rc1`  
**Git Baseline Commit**: `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Evaluation Date**: 2026-09-30  
**Classification**: **`AUDITED — REALISTIC PRODUCTION RISK MATRIX`**  

---

## 1. Executive Summary

This risk register documents the residual technical considerations and operational dependencies identified during the due-diligence audit of **SpiceGarden v1.0.0-rc1**. These items do not reflect software defects or architectural deficiencies; rather, they delineate external provider boundaries, infrastructure sizing limits, and recipient operational responsibilities.

---

## 2. Technical Risk Matrix

| Risk Identifier | Risk Category | Risk Description | Likelihood | Impact | Current Mitigations in Code | Recipient Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TR-01** | Compute Scaling | **Burst Authentication Scaling (>20k VUs)**: Extreme traffic spikes exceeding 20,000 concurrent VUs with heavy login volume may saturate CPU capacity if Kubernetes HPA maximum replica limit (20 pods) is reached. | Low | Medium | `CryptoConcurrencyLimiter` bounds CPU starvation; Argon2 work factor tuned to OWASP standards; Redis-backed rate limiting throttles abusive IPs. | Size Kubernetes cluster node groups to support auto-scaling up to 30+ replicas for national marketing campaigns. |
| **TR-02** | In-Memory Storage | **Redis Memory Growth under Heavy Telemetry**: High-frequency driver GPS tracking coordinates and ephemeral rate-limiter tokens consume RAM in Redis. | Medium | Medium | Redis keys are configured with explicit TTL expiration policies; BullMQ job history retention is pruned automatically. | Monitor Redis memory utilization in Grafana; configure Redis `allkeys-lru` or `volatile-lru` maxmemory eviction policy. |
| **TR-03** | Third-Party APIs | **External Provider Account Quotas**: Production transaction volume is constrained by third-party vendor tier limits (Twilio SMS throughput, SendGrid hourly sending limits, Google Maps API request quotas, FCM push rate limits). | Medium | High | Backoff/retry logic implemented across all outbound notification queues; Redis caching for geocoding and restaurant distance matrix. | Recipient must provision enterprise-tier service plans with Twilio, SendGrid, and Google Cloud with adequate spending limits. |
| **TR-04** | Operational Handover | **Recipient Account Configuration**: Merchant accounts (Stripe, Razorpay), mobile release signing keys (Google Play, Apple App Store), and authoritative DNS routing require recipient-owned credentials. | High | Medium | Zero hardcoded credentials in codebase; parameter injection via environment variables and Kubernetes Secrets; step-by-step handover runbooks provided. | Execute the Eight-Step Secret Rotation and Deployment Runbook upon receiving repository access. |
| **TR-05** | Database Connections | **PostgreSQL Connection Pool Sizing**: Direct database connections from ad-hoc operational tools could exhaust Postgres backend processes. | Low | Medium | PgBouncer transaction pooling (`default_pool_size=100`, `max_client_conn=1000`) mediates all API connections; composite indexes prevent query stalls. | Ensure external BI and reporting tools connect through PgBouncer or a dedicated read-replica. |

---

## 3. Risk Summary & Technical Conclusion

All listed technical risks have established architectural mitigations implemented within the software. None of the identified items prevent the commercial transfer or production deployment of SpiceGarden v1.0.0-rc1.
