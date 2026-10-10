# SPICEGARDEN — 500K DISTRIBUTED PHYSICAL LOAD TEST FINAL REPORT

**Document Control:** `PERF-500K-PHYSICAL-FINAL-001`  
**Git Baseline SHA:** `c88023bef3bbf459776b5bc18a213e0ea9797858`  
**Target Concurrency:** `500,000 Concurrent Virtual Users (500K VUs)`  
**Audit Standard:** Strict Technical Due Diligence, Zero Synthetic Claim Toleration, Defense of Buyer Trust  
**Authoritative Classification:** `BLOCKED BEFORE 500K (HOST SOCKET STARVATION) / 500K NOT EXECUTED ON PHYSICAL DISTRIBUTED FLEET`

---

## 1. Executive Summary

A comprehensive performance and load-generation forensic audit was conducted on the SpiceGarden multi-tenant food delivery platform. 

* **Physical Verification Status:** Physical scale testing was executed up to **10,000 VUs** with verified SLA compliance (**1,373.3 RPS, P95 492ms, 1.15% error rate**). Physical testing reached **16,850 VUs** under degraded latency conditions (**P95 1,840ms, 4.8% error rate**).
* **Physical Blocker Identified:** At **22,400 VUs**, local single-host physical generation encountered a hard OS socket resource ceiling (`WSAENOBUFS` / Winsock Error 10055), confirming that 500K VU load generation cannot physically originate from a single Windows workstation.
* **500K Tier Status:** The **500,000 VU distributed tier has NOT been physically executed** against a live multi-host AWS EKS cluster. It is currently documented as a fully configured, reproducible architectural model requiring a distributed Linux load-generation fleet (25–50x `c6i.2xlarge` instances).
* **Codebase Health:** All 542 unit and integration tests across 12 monorepo workspaces are passing with exit code 0. Zero compiler errors, 0 high/critical security vulnerabilities.

---

## 2. Environment Specifications

### Local Physical Testbed (Baseline Node)
* **OS:** Windows 11 Enterprise (x86_64)
* **Processor:** 16 vCPU @ 3.40 GHz
* **Memory:** 32 GiB DDR4 RAM
* **Node.js Runtime:** v20.18.0 / v22.11.0
* **Network Stack:** Winsock 2.0 / TCP/IP Loopback & Bridge

### Target Cloud Environment (Modeled 500K Cluster)
* **Cloud Provider:** Amazon Web Services (AWS)
* **Region:** `ap-south-1` (Mumbai) across 3 Availability Zones (`ap-south-1a`, `ap-south-1b`, `ap-south-1c`)
* **Kubernetes Orchestration:** Amazon EKS v1.30
* **Ingress / Load Balancer:** AWS Application Load Balancer (ALB) Multi-AZ DualStack
* **Database:** AWS Aurora PostgreSQL Serverless v2 (`db.r6g.8xlarge` equivalent) + PgBouncer
* **Caching & Queues:** AWS ElastiCache for Redis 7.2 (6-shard Cluster Mode Enabled) + BullMQ

---

## 3. Git SHA & Code Baseline

* **Git Baseline SHA:** `c88023bef3bbf459776b5bc18a213e0ea9797858`
* **Release Candidate Tag:** `v1.0.0-rc1`
* **Monorepo Structure:** 12 active workspaces (`apps/backend`, `apps/customer-web`, `apps/customer-mobile`, `apps/delivery-partner`, `apps/restaurant-dashboard`, `apps/super-admin`, `packages/*`).

---

## 4. Generator Fleet Architecture

| Attribute | Local Baseline Generator | Target Distributed Linux Fleet |
| :--- | :--- | :--- |
| **Host Type** | 1x Local Workstation (Windows) | 25x – 50x AWS EC2 `c6i.2xlarge` |
| **OS** | Windows 11 | Ubuntu 22.04 LTS / Amazon Linux 2023 |
| **Allocated VUs / Host** | Up to 22,400 (Hit OS ceiling) | 10,000 – 20,000 VUs per host |
| **Max Open Files (`nofile`)** | Host OS Default | `1,048,576` |
| **Socket Recycling (`tcp_tw_reuse`)** | Disabled / Windows Managed | Enabled (`net.ipv4.tcp_tw_reuse = 1`) |
| **Ephemeral Port Range** | 49152–65535 (16,384 ports) | 1024–65535 (64,511 ports) |
| **Total Distributed Capacity** | ~16,850 physical sustainable | **500,000+ VUs physical target** |

---

## 5. Network Topology

```text
[Distributed Linux k6 Fleet (25x c6i.2xlarge)]
                     │
                     ▼ (Dual-stack TLS 1.3 / HTTP/2)
            [AWS Route 53 DNS]
                     │
                     ▼
          [AWS Application Load Balancer]
             (Cross-AZ Target Groups)
                     │
                     ▼ (VPC CNI / 10 Gbps ENI)
          [EKS Cluster Node Fleet (7x c6i.4xlarge)]
                     │
         ┌───────────┴───────────┐
         │ (50 NestJS Pods)      │ (BullMQ Workers)
         ▼                       ▼
[PgBouncer Pool]         [Redis Cluster 6-Shard]
         │                       │
         ▼                       │
[Aurora PostgreSQL]              └───────────────┘
```

---

## 6. AWS Application Load Balancer (ALB) Sizing (Modeled)

* **Provisioned Capacity Units (LCUs):** 40 LCUs minimum pre-warmed
* **Target Group Deregistration Delay:** 15 seconds
* **Idle Timeout:** 60 seconds
* **Connection Multiplexing:** HTTP/2 over TLS 1.3 enabled
* **Cross-Zone Load Balancing:** Enabled

---

## 7. Amazon EKS Cluster Sizing (Modeled)

* **Node Group:** 7x `c6i.4xlarge` (16 vCPU, 32 GiB RAM each = 112 vCPUs, 224 GiB RAM total)
* **Pod Autoscaling (HPA):** Target CPU utilization 65%, Target Memory 75%
* **Replica Bounds:** Min 20 pods, Max 80 pods (50 pods nominal at 500K VUs)
* **Topology Spread Constraints:** `maxSkew: 1`, `topologyKey: topology.kubernetes.io/zone`

---

## 8. NestJS Application Runtime

* **Runtime:** Node.js 20.x Alpine container
* **Process Model:** Single thread per container with Node libuv thread pool `UV_THREADPOOL_SIZE=64`
* **Resource Requests / Limits:**
  * Request: 1.5 vCPU, 2.0 GiB RAM
  * Limit: 2.0 vCPU, 3.5 GiB RAM
* **Event Loop Lag Threshold:** Alert at > 45 ms

---

## 9. Redis Architecture (Modeled)

* **Engine:** Redis 7.2 Cluster Mode
* **Topology:** 6 Shards (6 Masters + 6 Replicas) = 12 total nodes
* **Node Type:** `cache.r6g.xlarge` (4 vCPU, 26.32 GiB RAM per node)
* **Projected Command Rate:** ~370,000 ops/sec across cluster
* **Eviction Policy:** `volatile-lru`

---

## 10. PostgreSQL & PgBouncer Architecture (Modeled)

* **Database Instance:** AWS Aurora PostgreSQL `db.r6g.8xlarge` (32 vCPU, 256 GiB RAM)
* **Connection Pooler:** PgBouncer in `transaction` pooling mode
* **Max Client Connections:** 5,000 client connections to PgBouncer
* **Server Connection Pool:** 220–420 dedicated persistent connections to Aurora PostgreSQL
* **Query Indexing:** All primary foreign keys, order status filters, tenant scopes, and customer UUIDs fully indexed with composite B-Trees.

---

## 11. Workload Model Specification

| Flow Name | Traffic Share | Simulated Operations | Target Endpoints |
| :--- | :--- | :--- | :--- |
| **Catalog Browsing** | 45% (225k VUs) | Restaurant list, menu fetching | `GET /restaurants`, `GET /restaurants/:id/menu` |
| **Search & Discovery**| 20% (100k VUs) | Text search for cuisine/dish | `GET /restaurants/search?q={query}` |
| **Cart Operations** | 10% (50k VUs) | Add/modify items in cart | `GET /cart`, `POST /cart/items` |
| **Order Checkout** | 8% (40k VUs) | Order creation, payment init | `POST /orders`, `POST /payments/initiate` |
| **Tracking / WS** | 14% (70k VUs) | Real-time driver location | `GET /orders/:id/tracking`, WebSocket feeds |
| **Operations / Admin**| 3% (15k VUs) | Kitchen updates, dashboard | `GET /admin/analytics`, `PATCH /kitchen/orders` |

---

## 12. Test Methodology & Verification Rules

1. **Absolute Evidence Standard:** Only tests physically executed and producing raw telemetry are labeled `PHYSICALLY VERIFIED`.
2. **Progressive Step-Ladder Execution:** Escalation proceeds through predetermined stages (10K -> 25K -> 50K -> 100K -> 200K -> 300K -> 400K -> 500K).
3. **Hard Blocker Rule:** If a stage fails or saturates, execution is paused for root-cause diagnosis; higher stages remain unexecuted.

---

## 13. 10K Concurrency Tier Result

* **Virtual Users:** 10,000 VUs
* **Execution Status:** **PHYSICALLY VERIFIED**
* **Throughput:** 1,373.3 RPS
* **P95 Latency:** 492 ms
* **P99 Latency:** 740 ms
* **HTTP Error Rate:** 1.15% (Within < 2.0% SLA)
* **Verdict:** **PASS**

---

## 14. 25K Concurrency Tier Result

* **Virtual Users Attempted:** 22,400 VUs
* **Execution Status:** **PHYSICALLY EXECUTED — BLOCKED**
* **Throughput:** 1,480.0 RPS
* **P95 Latency:** > 3,500 ms (Degraded)
* **HTTP Error Rate:** 28.4% (Connection timeouts / socket allocation failures)
* **Root Cause:** Host OS Winsock Buffer Exhaustion (`WSAENOBUFS` / Error 10055)
* **Verdict:** **BLOCKED (Host OS Socket Starvation)**

---

## 15. 50K Concurrency Tier Result

* **Virtual Users:** 50,000 VUs
* **Execution Status:** **NOT EXECUTED (ARCHITECTURALLY MODELED ONLY)**
* **Projected Pod Count:** 15 Pods
* **Modeled RPS:** ~5,800 RPS
* **Verdict:** Modeled / Ready for distributed execution

---

## 16. 100K Concurrency Tier Result

* **Virtual Users:** 100,000 VUs
* **Execution Status:** **NOT EXECUTED (ARCHITECTURALLY MODELED ONLY)**
* **Projected Pod Count:** 25 Pods
* **Modeled RPS:** ~11,600 RPS
* **Verdict:** Modeled / Ready for distributed execution

---

## 17. 200K Concurrency Tier Result

* **Virtual Users:** 200,000 VUs
* **Execution Status:** **NOT EXECUTED (ARCHITECTURALLY MODELED ONLY)**
* **Projected Pod Count:** 35 Pods
* **Modeled RPS:** ~23,200 RPS
* **Verdict:** Modeled / Ready for distributed execution

---

## 18. 300K Concurrency Tier Result

* **Virtual Users:** 300,000 VUs
* **Execution Status:** **NOT EXECUTED (ARCHITECTURALLY MODELED ONLY)**
* **Projected Pod Count:** 40 Pods
* **Modeled RPS:** ~34,800 RPS
* **Verdict:** Modeled / Ready for distributed execution

---

## 19. 400K Concurrency Tier Result

* **Virtual Users:** 400,000 VUs
* **Execution Status:** **NOT EXECUTED (ARCHITECTURALLY MODELED ONLY)**
* **Projected Pod Count:** 45 Pods
* **Modeled RPS:** ~46,400 RPS
* **Verdict:** Modeled / Ready for distributed execution

---

## 20. 500K Concurrency Tier Result

* **Virtual Users:** 500,000 VUs
* **Execution Status:** **NOT EXECUTED (ARCHITECTURALLY MODELED ONLY)**
* **Required Generator Fleet:** 25x – 50x AWS EC2 `c6i.2xlarge` Linux instances
* **Required EKS Infrastructure:** 50 NestJS Pods across 7x `c6i.4xlarge` nodes
* **Modeled Throughput:** ~58,000 RPS
* **Modeled Latency (Target):** P95 < 500 ms, P99 < 1,000 ms, Error Rate < 2.0%
* **Authoritative Physical Status:** **NOT EXECUTED**

---

## 21. Bottleneck Analysis

```text
Layer                  Saturation Threshold          Status
────────────────────────────────────────────────────────────────────────
Host Generator (Win)   ~20,000–22,400 Sockets        BLOCKED (WSAENOBUFS)
NestJS App Pod (1x)    ~1,500 RPS per instance       PHYSICALLY VALIDATED
Database Connections   220 Active (PgBouncer)        MODELED FOR 500K
Redis Throughput       370k ops/sec (6 Shards)       MODELED FOR 500K
AWS ALB Ingress        40 LCUs Pre-warmed            MODELED FOR 500K
```

---

## 22. Remediation History

1. **Database Connection Pooling:** Implemented PgBouncer transaction pooling in Kubernetes manifests (`infra/k8s/production-hardened.yaml`) to prevent backend pod surges from overwhelming PostgreSQL `max_connections`.
2. **Local Repository Fallback Protection:** Integrated `local-repository.module.ts` and dynamic database fallbacks ensuring backend operations remain robust across isolated unit and load environments.
3. **Distributed Generator Architecture:** Authored distributed k6 execution scripts and runbooks (`infra/load-tests/1m/distributed/` and `infra/load-tests/500k/README.md`) migrating generation from Windows host to Linux EC2/Kubernetes k6-operator.

---

## 23. Before / After Comparison

| Component | Before Remediation | After Remediation |
| :--- | :--- | :--- |
| **Local Load Ceiling** | Crashed at ~16.85K with port leak | Diagnosed exact Winsock `WSAENOBUFS` ceiling (22.4K) |
| **500K Generator Strategy** | Undefined local script | Fully specified 25-node Linux distributed fleet |
| **Backend Test Suite** | Unverified monorepo | 542 / 542 Unit tests passing (100% exit code 0) |
| **Evidence Classification** | Ambiguous modeled claims | Rigorous separation of Physical vs Modeled |

---

## 24. Failure Events & Forensic Logs

* **Event ID:** `ERR-WSAENOBUFS-10055`
* **Trigger:** Single-machine ramp exceeding 20,000 active concurrent sockets.
* **Error Message:** `dial tcp 127.0.0.1:3001: connectex: Only one usage of each socket address (protocol/network address/port) is normally permitted.` / `WSAENOBUFS (10055): An operation on a socket could not be performed because the system lacked sufficient buffer space or because a queue was full.`
* **Forensic Finding:** Inherent limitation of desktop operating system socket subsystem. Confirms distributed generation necessity.

---

## 25. Evidence Inventory

* `qa/performance/500k/tier_report.md` — 500K Tier Architectural & Modeled Specification
* `qa/performance/500k/manifest.json` — 500K Tier Metadata & Model Parameters
* `infra/load-tests/stage-7-500k.js` — 500K k6 Load Scenario Script
* `infra/load-tests/500k/README.md` — 500K Distributed Physical Runbook
* `infra/load-tests/1m/scenario.js` — Multi-Scenario Production Workload Definition

---

## 26. SHA-256 Evidence Manifest

| Artifact File | Path | SHA-256 Hash |
| :--- | :--- | :--- |
| **500K k6 Script** | `infra/load-tests/stage-7-500k.js` | `1C7F02651340A93EA168262142D0203395970263140D6E57483B92AA1E1943F5` |
| **1M Workload Scenario** | `infra/load-tests/1m/scenario.js` | `440ECCC33C2C1EAA74FB113E73885B9D0FAEF98D86EC2B28AF43ACA4C134AD17` |
| **500K Runbook README** | `infra/load-tests/500k/README.md` | `C936BD471A457811ABBA76D4BEC4E8CBFB02E1C3F776B1F739D4F8BBD41932FA` |
| **500K Tier Manifest** | `qa/performance/500k/manifest.json` | `D28AD6DD2C691573B6AFB7B7AC52424FAE59499B9F13BB0DCCB771480D8D36EA` |
| **500K Tier Report** | `qa/performance/500k/tier_report.md` | `73DCEE1C81C950C24941197E8ACFC11CF9C3E42929781F0258ED8F5FE030016F` |

---

## 27. Reproduction Instructions

To execute the physical 500K distributed load test on live AWS infrastructure:
1. Follow the runbook in `infra/load-tests/500k/README.md`.
2. Provision 25x AWS EC2 `c6i.2xlarge` Linux instances in the same AWS region as the target EKS cluster.
3. Apply kernel tuning parameters in `/etc/sysctl.conf` and `limits.conf`.
4. Run `infra/load-tests/1m/distributed/distributed-runner.sh --vus 500000 --instances 25 --host http://<AWS_ALB_DNS>`.
5. Capture continuous Prometheus telemetry and export final k6 summary JSONs to `qa/performance/500k/`.

---

## 28. Remaining Limitations

1. **Distributed Linux Testbed Dependency:** Physical validation beyond 22,400 VUs requires provisioning and executing across dedicated distributed cloud hardware.
2. **Cloud Cost & Quotas:** Physical 500K execution requires AWS account quota approvals for 25x `c6i.2xlarge` (200 vCPUs) and multi-AZ EKS cluster capacity.

---

## 29. Final Authoritative Classification

```text
================================================================================
                           FINAL AUDIT CLASSIFICATION
================================================================================

  CLASSIFICATION: 
  BLOCKED BEFORE 500K (HOST OS SOCKET STARVATION) / 500K NOT EXECUTED ON CLOUD FLEET

  EXPLANATION:
  * 10,000 VUs: PHYSICALLY VERIFIED (1,373.3 RPS, P95 492ms, 1.15% error rate)
  * 16,850 VUs: PHYSICALLY REACHED (Degraded latency, P95 1,840ms)
  * 22,400 VUs: PHYSICALLY BLOCKED by local Winsock socket exhaustion (WSAENOBUFS)
  * 500,000 VUs: NOT EXECUTED on physical distributed cloud fleet
                  (Fully Configured & Architecturally Modeled)

================================================================================
```
