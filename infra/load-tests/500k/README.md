# SpiceGarden 500K Distributed Physical Load Testing Runbook & Specification

## 1. Overview & Architecture Target

This runbook specifies the complete, reproducible operational procedure for executing a distributed 500,000 Virtual User (500K VU) physical stress test against the SpiceGarden infrastructure.

```
                    ┌──────────────────────────────────────────────┐
                    │ Distributed k6 Fleet (25x-50x c6i.2xlarge)   │
                    │ Linux (Amazon Linux 2023 / Ubuntu 22.04 LTS) │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼ (AWS VPC / 100 Gbps Transit)
                                     AWS Network
                                           │
                                           ▼
                                 AWS Application LB (ALB)
                                  (Multi-AZ Provisioned)
                                           │
                                           ▼ (Target Group: NodePort / IP)
                                 Amazon EKS Cluster
                                  (7x c6i.4xlarge Nodes)
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
                 NestJS Application                    Background Workers
                 (50 Pods HPA Scaled)                  (BullMQ Consumers)
                        │                                     │
             ┌──────────┴──────────┐               ┌──────────┴──────────┐
             │                     │               │                     │
      ElastiCache Redis     Aurora PostgreSQL     BullMQ Streams      External APIs
     (6-Shard Cluster)     (db.r6g.8xlarge +      (Redis-backed)     (Mocked Gateways)
                            PgBouncer Pool)
```

---

## 2. Host OS & Generator Requirements (Windows vs Linux)

### Why Windows Cannot Generate 500K VUs Locally:
1. **Winsock `WSAENOBUFS` (Error 10055):** Windows desktop kernel socket buffers exhaust when ephemeral port allocation and non-paged pool memory reach ceiling under rapid connection churn (>20,000 active sockets).
2. **TCP TIME_WAIT & Port Reuse:** Default Windows `TcpTimedWaitDelay` is 120s–240s, causing rapid depletion of the 16,384–65,535 ephemeral port range.
3. **Distributed Generator Requirement:** Physical generation of 500,000 concurrent VUs requires moving execution off the local Windows workstation to a dedicated distributed Linux fleet.

### Generator Specifications:
* **Instance Type:** `c6i.2xlarge` (8 vCPU, 16 GiB RAM, 12.5 Gbps network)
* **OS:** Ubuntu 22.04 LTS or Amazon Linux 2023
* **Fleet Size:** 25 instances (allocating 20,000 VUs per instance) or 50 instances (allocating 10,000 VUs per instance)
* **Kernel Tuning Parameters (`/etc/sysctl.conf`):**
  ```bash
  fs.file-max = 2097152
  net.core.somaxconn = 65535
  net.ipv4.ip_local_port_range = 1024 65535
  net.ipv4.tcp_tw_reuse = 1
  net.ipv4.tcp_fin_timeout = 15
  net.core.netdev_max_backlog = 100000
  net.core.rmem_max = 16777216
  net.core.wmem_max = 16777216
  ```
* **Process File Descriptors (`/etc/security/limits.conf`):**
  ```text
  * soft nofile 1048576
  * hard nofile 1048576
  ```

---

## 3. Workload Configuration & Endpoint Proportions

The 500K workload simulates realistic multi-tenant production traffic:

| Flow / Scenario | Percentage | Target VUs (at 500K) | Endpoints Targeted | Method |
| :--- | :--- | :--- | :--- | :--- |
| **Browse & Catalog** | 45% | 225,000 VUs | `/restaurants`, `/restaurants/:id/menu` | `GET` |
| **Search & Discovery** | 20% | 100,000 VUs | `/restaurants/search?q={query}` | `GET` |
| **Cart Operations** | 10% | 50,000 VUs | `/cart`, `/cart/items` | `GET`, `POST` |
| **Checkout & Orders** | 8% | 40,000 VUs | `/orders`, `/payments/initiate` | `POST` |
| **Live Tracking & WebSockets** | 14% | 70,000 VUs | `/orders/:id/tracking`, `/ws/tracking` | `GET`, `WS` |
| **Admin & Restaurant Operations**| 3% | 15,000 VUs | `/admin/analytics`, `/kitchen/orders` | `GET`, `PATCH` |

---

## 4. Execution Step-by-Step

### Step 1: Pre-flight Verification
```bash
# Verify backend health and metrics endpoint
curl -s http://<ALB_DNS>/health | jq .
curl -s http://<ALB_DNS>/metrics | grep process_cpu_usage
```

### Step 2: Launch Distributed Generators (via k6 Operator or Ansible/Terraform)
```bash
# Deploy distributed k6 Custom Resource to Kubernetes:
kubectl apply -f infra/load-tests/1m/distributed/k8s-k6-operator.yaml

# Or execute via shell script across EC2 fleet:
bash infra/load-tests/1m/distributed/distributed-runner.sh --vus 500000 --instances 25 --host http://<ALB_DNS>
```

### Step 3: Progressive Ladder Execution
1. **Tier 1 (10K VUs):** 5m warm-up, 10m sustain. Confirm P95 < 500ms, Error < 1%.
2. **Tier 2 (25K VUs):** 5m ramp, 10m sustain. Confirm ALB connection handling.
3. **Tier 3 (50K VUs):** 5m ramp, 10m sustain. Confirm NestJS pod autoscaling (10 -> 20 pods).
4. **Tier 4 (100K VUs):** 10m ramp, 15m sustain. Confirm Redis shard distribution.
5. **Tier 5 (200K VUs):** 10m ramp, 15m sustain. Confirm PgBouncer pool stability.
6. **Tier 6 (300K VUs):** 10m ramp, 15m sustain. Monitor BullMQ queue lag.
7. **Tier 7 (400K VUs):** 10m ramp, 15m sustain. Monitor EKS node network saturation.
8. **Tier 8 (500K VUs):** 15m ramp, 30m-240m sustain. Full telemetry capture.

---

## 5. Observability & Telemetry Collection

During execution, stream metrics to Prometheus / InfluxDB and monitor via Grafana:
* **k6 Dashboard:** Active VUs, Iteration Rate, HTTP Req Duration (P50/P95/P99), Error Rate.
* **ALB Dashboard:** Target Response Time, Active Connection Count, Request Count / sec, HTTP 5XX / 4XX counts.
* **EKS Dashboard:** CPU Utilization per Pod, Memory RSS per Pod, Pod Restarts, Network I/O.
* **Redis Dashboard:** Instantaneous Ops/sec, Connected Clients, Used Memory, Keyspace Hits/Misses.
* **PostgreSQL Dashboard:** Active Transactions, Pool Utilization, Cache Hit Ratio, Deadlocks, Query Latency.

---

## 6. Teardown & Post-Test Data Room Preservation

```bash
# 1. Stop generators
kubectl delete -f infra/load-tests/1m/distributed/k8s-k6-operator.yaml

# 2. Export and compress raw test logs and JSON summaries
mkdir -p qa/performance/500k/raw_run_$(date +%Y%m%d_%H%M%S)
cp -r /tmp/k6-results/* qa/performance/500k/

# 3. Calculate SHA-256 evidence hashes
sha256sum qa/performance/500k/* > qa/performance/500k/checksums.sha256
```
