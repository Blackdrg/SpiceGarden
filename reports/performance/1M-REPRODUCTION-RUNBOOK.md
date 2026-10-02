# SPICEGARDEN — 1M DISTRIBUTED PHYSICAL REPRODUCTION RUNBOOK

**Document Control:** `1M-RUNBOOK-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Target Architecture:** Distributed Linux k6 Fleet + AWS EKS Hardened Production

---

## 1. Prerequisites & Environment Setup

1. **Target Cluster Provisioning:**
   ```bash
   kubectl apply -f infra/k8s/production-hardened.yaml
   kubectl apply -f infra/k8s/cdn-ingress.yaml
   ```
2. **Verify Pod Availability:**
   ```bash
   kubectl get pods -n spicegarden -l app.kubernetes.io/name=backend
   # Expected: 120 Backend Pods running across 15 c6i.4xlarge worker nodes
   ```
3. **Verify PgBouncer & Database Connectivity:**
   ```bash
   kubectl exec -it deployment/pgbouncer -n spicegarden -- psql -U postgres -c "SHOW POOLS;"
   ```

---

## 2. Distributed Linux Load Generator Deployment

1. **Provision 40× `c6i.2xlarge` Generator Instances (Ubuntu 22.04 LTS).**
2. **Apply Kernel Optimization Script:**
   ```bash
   sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
   sudo sysctl -w net.ipv4.tcp_tw_reuse=1
   sudo sysctl -w net.ipv4.tcp_fin_timeout=15
   sudo sysctl -w net.core.somaxconn=65535
   sudo sysctl -w fs.file-max=2097152
   ```
3. **Execute Distributed 1M Run:**
   ```bash
   bash infra/load-tests/1m/distributed/distributed-runner.sh --target-vus 1000000 --duration 1800s
   ```

---

## 3. Real-Time Telemetry & Health Monitoring

* **Backend Prometheus:** `http://<prometheus-nlb>:9090`
* **Grafana Master Dashboard:** `http://<grafana-nlb>:3000`
* **Real-time Metrics:**
  - `sum(rate(http_requests_total[1m]))` (Target: 140,000 req/sec)
  - `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))` (Target: < 500ms)
  - `socket_io_active_connections` (Target: 300,000 active WebSockets)
