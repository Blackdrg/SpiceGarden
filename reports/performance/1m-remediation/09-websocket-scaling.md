# SpiceGarden Performance Remediation — 09: WebSocket Real-Time Scaling Architecture

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Single-Node Capacity vs Horizontal Cluster

* **Single-Process Limit:** ~2,500 concurrently connected sockets on single Node.js instance.
* **Horizontal Scaling:** Implemented Socket.IO Redis pub/sub adapter allowing cross-pod broadcast across Kubernetes backend replicas.

---

## 2. Progressive WebSocket Capacity Matrix

| Target Sockets | Pod Replicas | Sockets / Pod | Broadcast Latency (p95) | Redis Pub/Sub Bandwidth | Status |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **2,500 Sockets** | 1 Pod | 2,500 | 18.2 ms | 1.4 MB/s | `VERIFIED` |
| **5,000 Sockets** | 2 Pods | 2,500 | 24.5 ms | 3.2 MB/s | `VERIFIED WITH LIMITATIONS` |
| **10,000 Sockets** | 4 Pods | 2,500 | 32.0 ms | 6.8 MB/s | `MODELLED / CLUSTER VALIDATED` |
| **50,000 Sockets** | 20 Pods | 2,500 | 58.0 ms | 34.0 MB/s | `MODELLED` |
| **80,000 Sockets** | 40 Pods | 2,000 | 85.0 ms | 68.0 MB/s | `1M VU CAPACITY MODEL` |
