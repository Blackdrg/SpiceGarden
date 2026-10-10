# SPICEGARDEN — KUBERNETES & CLOUD INFRASTRUCTURE SPECIFICATION (Section 19)

**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Target Scale:** `1,000,000 Virtual Users`

---

## 1. Production Kubernetes Cluster Architecture (AWS EKS)

```mermaid
flowchart TD
    DNS[AWS Route 53 / CloudFront CDN] --> ALB[AWS Application Load Balancer]
    ALB --> INGRESS[Envoy / NGINX Ingress Controller Fleet]
    INGRESS --> PODS[SpiceGarden Backend API Pods (120 Pods)]
    INGRESS --> WS_PODS[Dedicated WebSocket Pods (400 Pods)]
    PODS --> PGBOUNCER[PgBouncer Connection Multiplexer (6 Instances)]
    PGBOUNCER --> AURORA_WRITER[(Amazon Aurora PostgreSQL 16 Writer)]
    PGBOUNCER --> AURORA_READER[(Amazon Aurora PostgreSQL 16 Read Replicas x3)]
    PODS --> REDIS_CLUSTER[(Amazon ElastiCache Redis Cluster 7.2 - 6 Nodes)]
    PODS --> BULLMQ_WORKERS[BullMQ Queue Processing Fleet (24 Pods)]
```

---

## 2. Infrastructure Sizing for 1M Scale

* **EKS Node Pool:** 30x `c6i.4xlarge` instances (16 vCPU, 32 GB RAM per node)
* **API Service:** 120 Pods (Requests: 1 vCPU, 1 GB RAM; Limits: 2 vCPU, 2 GB RAM)
* **WebSocket Service:** 400 Pods (2,500 active sockets/pod = 1,000,000 simultaneous connections)
* **Database:** Amazon Aurora PostgreSQL `db.r6g.8xlarge` (32 vCPU, 256 GB RAM) + 3 Read Replicas
* **PgBouncer:** 6 Multiplexer Pods (pool size = 50 physical connections per instance)
* **Redis Cluster:** 3 Shards / 6 Nodes `cache.r6g.2xlarge` (52 GB memory per node)
* **Queue Workers:** 24 BullMQ Worker Pods dedicated to order dispatch and notifications
