# SPICEGARDEN PHYSICAL TEST DIRECTORY MANIFEST
Status: PHYSICAL VALIDATION BLOCKED — INFRASTRUCTURE UNAVAILABLE
Commit SHA: d55af75f6039cb158c9a6823a46d1de170cd2567
Date: 2026-10-03T12:28:00.000Z

All subdirectories are initialized for live telemetry ingestion:
- alb/ : Awaiting live CloudWatch metrics from AWS ALB
- eks/ : Awaiting live Prometheus/Container Insights metrics from EKS 160-pod cluster
- postgres/ : Awaiting live Performance Insights metrics from Aurora PostgreSQL db.r6g.16xlarge
- pgbouncer/ : Awaiting live pool metrics from 8 PgBouncer instances
- redis/ : Awaiting live Redis INFO metrics from 12-node ElastiCache cluster
- bullmq/ : Awaiting live job queue depth telemetry
- application/ : Awaiting live NestJS event-loop, memory, and GC metrics
