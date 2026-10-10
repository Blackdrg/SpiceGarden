# SPICEGARDEN — 500K OBSERVABILITY & TELEMETRY PROTOCOL

## 1. Full-Stack Telemetry Pipeline

To ensure complete empirical observability during 500K benchmark execution, metrics, logs, and traces are aggregated across every tier:

```text
[ 40x Load Generators ] ──> Prometheus Remote Write ──┐
[ AWS ALB Ingress      ] ──> CloudWatch Metrics        ──┼──> [ Prometheus / Grafana Dashboard ]
[ EKS Pods / cAdvisor  ] ──> Prometheus Node Exporter  ──┤    (Real-Time Latency, RPS, Error Rate)
[ NestJS Prometheus /metrics ] ──> Prometheus Scraper  ──┤
[ Aurora PostgreSQL Exporter ] ──> Prometheus Scraper  ──┤
[ Redis Cluster Exporter     ] ──> Prometheus Scraper  ──┤
[ BullMQ Queue Metrics       ] ──> Prometheus Scraper  ──┘
```

---

## 2. Telemetry Metric Collection Schema

| Infrastructure Tier | Critical Metric Key | Prometheus / CloudWatch Source | SLA Threshold |
| :--- | :--- | :--- | :--- |
| **Load Generators** | `k6_active_vus` | `k6_vus` (Prometheus remote write) | `>= 500,000` |
| **Load Generators** | `k6_generator_cpu` | `node_cpu_seconds_total` | `< 75%` |
| **Load Generators** | `k6_socket_drops` | `netstat_tcp_retrans_segs` | `0` |
| **ALB Ingress** | `alb_target_response_time` | AWS CloudWatch `TargetResponseTime` | P95 `< 250 ms`, P99 `< 500 ms` |
| **ALB Ingress** | `alb_5xx_rate` | AWS CloudWatch `HTTPCode_Target_5XX_Count` | `< 0.10%` |
| **EKS Nodes / Pods** | `container_cpu_utilization`| `container_cpu_usage_seconds_total` | `< 70%` average across pods |
| **NestJS App** | `nodejs_eventloop_lag_seconds` | `nodejs_eventloop_lag_p99_seconds` | `< 20 ms` |
| **PgBouncer** | `pgbouncer_pools_client_waiting` | `pgbouncer_pools_client_waiting` | `< 10 clients` |
| **Aurora PostgreSQL** | `aurora_cpu_utilization` | AWS RDS `CPUUtilization` | `< 80%` |
| **Aurora PostgreSQL** | `aurora_write_latency` | AWS RDS `WriteLatency` | `< 5 ms` |
| **Redis Cluster** | `redis_connected_clients` | `redis_connected_clients` | Monitored, steady |
| **Redis Cluster** | `redis_ops_per_sec` | `redis_instantaneous_ops_per_sec` | `< 80,000 ops/shard` |
| **BullMQ Queues** | `bullmq_jobs_waiting` | `bullmq_waiting_jobs_count` | `< 5,000` with recovery |
| **BullMQ Queues** | `bullmq_jobs_failed` | `bullmq_failed_jobs_count` | `0 unhandled` |

---

## 3. Telemetry Verification Checklist
* [x] OpenSearch cluster logs ingest configured.
* [x] Prometheus server scraping endpoints on port 9090.
* [x] Grafana dashboards provisioned on port 3000.
* [x] NestJS `/metrics` endpoint exporting Node.js process and HTTP request histograms.
