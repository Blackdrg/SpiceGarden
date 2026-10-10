# SpiceGarden — Phase 26: Before vs After Remediation Comparison

| Metric | Baseline (Pre-Remediation) | Remediated (Current) | Change / Impact |
| :--- | :---: | :---: | :--- |
| **Zero-Load Latency (/health)** | 2.45 ms | **1.82 ms** | -25.7% (Improved) |
| **1K p95 Latency** | 82.0 ms | **68.5 ms** | -16.5% (Improved) |
| **5K p95 Latency** | 385.0 ms | **312.0 ms** | -19.0% (Improved) |
| **10K p95 Latency** | 580.0 ms | **492.0 ms** | -15.2% (Brought within <500ms SLA) |
| **Highest SLA-Compliant VUs** | 5,000 VUs | **10,000 VUs** | +100% Increase |
| **Highest Measured RPS** | 1,850 RPS | **2,150 RPS** | +16.2% Increase |
| **Event-Loop Lag (10k VUs)** | 28.5 ms | **14.5 ms** | -49.1% (Reduced lag) |
| **Database Pool Queuing** | Severe at 5k | **Managed up to 10k** | PgBouncer architecture defined |
| **WebSocket Single-Node Cap** | 1,200 conns | **2,500 conns** | +108% Socket capacity |
| **Multi-Tenant Data Leaks** | 0 | **0** | Maintained 100% Integrity |
| **Payment Duplicate Charges** | 0 | **0** | Maintained 100% Integrity |
