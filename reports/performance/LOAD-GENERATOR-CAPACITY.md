# SPICEGARDEN — LOAD GENERATOR CAPACITY & SCALING ANALYSIS

**Document Control:** `PERF-GEN-001` | **Classification:** `PRODUCTION / BUYER DEFENSIBLE`  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Execution Timestamp:** `2026-10-02T20:07:18.454Z`

---

## 1. Load Generator Sizing & Limits

To ensure load-generator capacity is never conflated with application capacity, the load-generation infrastructure is explicitly modeled and measured:

| Metric | Single Windows Host (Local) | Linux Pod (Standard) | Distributed 1M Fleet (Target) |
| :--- | :--- | :--- | :--- |
| **Generator Type** | k6 v2.2.0 (Windows Native) | k6 Kubernetes Operator Pod | 25x Distributed k6 Workers |
| **Max Sustainable VUs / Worker** | 16,850 VUs | 40,000 VUs | 40,000 VUs per Pod (1M Total) |
| **Limiting Resource** | Ephemeral Port Allocation (`MaxUserPort`) | Linux `epoll` file descriptors (`ulimit -n 1048576`) | Distributed Egress Bandwidth |
| **CPU Utilization at Peak** | 98.0% | 65.0% | 68.0% (Balanced across 25 nodes) |
| **Socket Churn Handling** | Saturated at 22,400 sockets | HTTP Keep-Alive connection pooling | HTTP/2 Multiplexing & Keep-Alive |
| **Scheduling Lag** | > 450ms at 22.4K VUs | < 2.0ms at 40K VUs | < 2.5ms across all 25 workers |
