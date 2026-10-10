# SpiceGarden Enterprise SaaS — Scalability Claim Register

**Release Candidate:** v1.0.0-rc1  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Audit Date:** 2026-10-02  

---

## 1. Formal Claim Classifications

1. **1,000 to 10,000 VUs:** `SLA-COMPLIANT` (Live benchmarked, p95 < 500ms, error rate < 2%).
2. **15,000 VUs:** `SUSTAINED (DEGRADED)` (Live benchmarked, 1,700 RPS, p95 745ms, error rate 2.40%).
3. **20,000 VUs:** `HIGHEST SUSTAINED` (Live benchmarked, 16,850 VUs sustained, 1,942 RPS, p95 960ms).
4. **30,000 VUs:** `OBSERVED / BLOCKED` (22,400 VUs instantiated; host Windows dynamic port exhausted).
5. **50,000 to 1,000,000 VUs:** `CAPACITY MODEL` (Empirically derived mathematical model based on per-VU consumption).
