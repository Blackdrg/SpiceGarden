# Performance Test Environment Metadata

## 1. Application Under Test
- **Product**: SpiceGarden Enterprise Food-Delivery Platform
- **Release Version**: `v1.0.0-rc1`
- **Git Baseline Commit**: `ca349e510d3c18a7517da7502f70ef15bd37fe77`
- **Node.js Version**: `v25.5.0`
- **npm Version**: `9.9.4`
- **k6 Version**: `k6.exe v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64)`

## 2. Infrastructure Architecture & Scaling Target
- **Deployment Platform**: Kubernetes (Target Staging/Production) / Node.js standalone dev baseline
- **API Horizontal Pod Autoscaler (HPA)**: Min 3 replicas, Max 20 replicas (target 70% CPU / 80% RAM threshold)
- **Worker Configuration**: BullMQ async workers (min 2, max 8 replicas)
- **Primary Database**: PostgreSQL 16 (TypeORM / Connection Pool max 50–200 with PgBouncer)
- **Document & Telemetry Store**: MongoDB 7.0
- **Cache / Distributed Locks**: Redis 7.2 (Standalone / Cluster target 6 nodes)
- **Realtime Gateway**: Socket.IO / Engine.IO WebSocket mesh
