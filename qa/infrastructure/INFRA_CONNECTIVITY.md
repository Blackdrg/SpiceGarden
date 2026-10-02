# SPICEGARDEN INFRASTRUCTURE & NETWORK CONNECTIVITY AUDIT
**Release Baseline:** `v1.0.0-rc1` | **Environment:** Staging / Production Hardened K8s

## 1. Infrastructure Services Matrix

| Service / Component | Protocol / Port | Health Check Endpoint | Target Response | Network Isolation | Connectivity Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API Gateway** | HTTP/1.1 (3001) | `/health` | 200 OK (`{"status":"ok"}`)| Ingress / Internal VPC | **VERIFIED** |
| **PostgreSQL Primary** | TCP (5432) | `pg_isready` | Accepting connections | Private DB Subnet | **VERIFIED** |
| **PgBouncer Pooler** | TCP (6432) | `SHOW POOLS` | Pool active | VPC Peering | **VERIFIED** |
| **Redis Cache / BullMQ**| TCP (6379) | `PING` -> `+PONG` | Connection healthy | Secure Password Auth | **VERIFIED** |
| **OpenSearch Cluster** | HTTP (9200) | `/_cluster/health` | Status Green | Logstash Pipeline | **VERIFIED** |
| **Prometheus Metrics** | HTTP (9090) | `/-/healthy` | Prometheus server ready | Internal Telemetry | **VERIFIED** |
| **Grafana Dashboard** | HTTP (3000) | `/api/health` | Grafana online | Admin Gateway | **VERIFIED** |
