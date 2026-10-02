# SpiceGarden Performance Remediation — Deep Root-Cause Bottleneck Analysis

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Root Cause Breakdown

``mermaid
graph TD
    A[Observed Concurrency Ceilings] --> B[Bottleneck 1: CPU Scheduling]
    A --> C[Bottleneck 2: Database Connection Pool]
    A --> D[Bottleneck 3: OS Port Exhaustion]
    
    B --> B1[Cause: k6 & Node on same 2-core CPU]
    B --> B2[Remedy: Kubernetes Horizontal Scaling & Pod Separation]
    
    C --> C1[Cause: TypeORM pool capped at 20 direct sockets]
    C --> C2[Remedy: PgBouncer transaction pooling tier]
    
    D --> D1[Cause: Windows 16k dynamic socket cap]
    D --> D2[Remedy: Distributed Linux k6 generation nodes]
``
---

## 2. Detailed Technical Investigation

### A. Host CPU Scheduling Contention
* **Evidence:** At >15,000 VUs, host CPU reached 98%–100%.
* **Mechanism:** The k6 load generator running Go runtime goroutines competed with the V8 libuv thread pool on the same 2 physical cores, inflating timer resolution and socket polling latency.
* **Resolution:** Decoupling the load generation tier onto dedicated Linux instances resolves this contention completely.

### B. Database Connection Saturation
* **Evidence:** At >10,000 VUs, active connections saturated at 20/20 with up to 412 queued query requests.
* **Mechanism:** When multiple HTTP requests concurrently perform database transactions, requests block in the Node.js pg driver queue waiting for connection release.
* **Resolution:** Deploying PgBouncer in transaction mode multiplexes thousands of application requests over a bounded pool of database sockets.

### C. Client Dynamic Port Exhaustion
* **Evidence:** At 30,000 VUs, k6 reported `WSAENOBUFS` and socket connection aborts.
* **Mechanism:** Windows dynamic socket range is constrained to 16,384 ephemeral ports (`MaxUserPort`).
* **Resolution:** Distributing load across multiple Linux worker nodes with tuned `ip_local_port_range` (64,512 ports per node).
