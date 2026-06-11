# Multi-Region Architecture

## Overview

SpiceGarden implements a **multi-region active-active architecture** with regional failover capabilities. This ensures low latency for users, high availability, and disaster recovery.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GLOBAL LOAD BALANCER                       │
│                   (GeoDNS + Anycast)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  APAC REGION    │ │  EMEA REGION    │ │  AMER REGION    │
│  (Primary)      │ │ (Secondary)     │ │ (Tertiary)      │
│                 │ │                 │ │                 │
│  Singapore       │ │  Frankfurt        │ │  Oregon          │
│  ┌─────────────┐│ │  ┌─────────────┐│ │  ┌─────────────┐│
│  │   Backend   ││ │  │   Backend   ││ │  │   Backend   ││
│  │   x 3 Pods  ││ │  │   x 2 Pods  ││ │  │   x 2 Pods  ││
│  └─────────────┘│ │  └─────────────┘│ │  └─────────────┘│
│  ┌─────────────┐│ │  ┌─────────────┐│ │  ┌─────────────┐│
│  │ PostgreSQL  ││ │  │ PostgreSQL  ││ │  │ PostgreSQL  ││
│  │ Read Replica│ │  │ Read Replica│ │ │  │ Read Replica│ │
│  └─────────────┘│ │  └─────────────┘│ │  └─────────────┘│
│  ┌─────────────┐│ │  ┌─────────────┐│ │  ┌─────────────┐│
│  │ Redis       ││ │  │ Redis       ││ │  │ Redis       ││
│  │ Cache       ││ │  │ Cache       ││ │  │ Cache       ││
│  └─────────────┘│ │  └─────────────┘│ │  └─────────────┘│
└─────────────────┘ └─────────────────┘ └─────────────────┘
            ▲                   ▲                   ▲
            └───────────────────┼───────────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │   CENTRAL DATABASE    │
                    │    (Multi-Master)     │
                    │   Synchronized via    │
                    │   Logical Replication │
                    └─────────────────────────┘
```

## Regional Configuration

| Region | Location | Primary | Replicas | Latency Target |
|--------|----------|---------|----------|----------------|
| APAC | Singapore | ✅ | 2 | < 100ms Asia/Pacific |
| EMEA | Frankfurt | | 1 | < 100ms Europe/Middle East |
| AMER | Oregon | | 1 | < 100ms North/South America |

## Traffic Routing

### GeoDNS Configuration

```hcl
# Route53 GeoDNS
resource "aws_route53_record" "api_apac" {
  zone_id = var.zone_id
  name    = "api.spicegarden.com"
  type    = "A"
  alias {
    name                   = aws_lb.apac.dns_name
    zone_id                = aws_lb.apac.zone_id
    evaluate_target_health = true
  }
  set_identifier = "apac"
  geolocation_routing_policy {
    continent = "AS"
  }
}
```

### Failover Logic

1. **Primary region failure**: Traffic routes to next closest region
2. **Automatic health checks**: Every 30 seconds via Kubernetes probes
3. **Graceful degradation**: Read-only mode with cached data

## Data Synchronization

### Multi-Master PostgreSQL

```yaml
# PostgreSQL replication configuration
postgresql:
  synchronous_commit: on
  synchronous_standby_names: 'FIRST 1 (apac-sync, emea-sync)'
  max_wal_senders: 5
  wal_keep_segments: 32
```

### Redis Geo-Replication

```yaml
redis:
  cluster-enabled: yes
  cluster-node-timeout: 5000
  replication: synchronous
```

## Service Discovery

### Kubernetes Multi-Region Setup

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-global
  annotations:
    service.kubernetes.io/topology.preserve: "region"
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local
  healthCheckNodePort: 30001
  loadBalancerIP: <anycast-ip>
```

## Disaster Recovery

### Regional Outage Detection

```bash
# Health check script runs in each region
#!/bin/bash
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$HEALTH" != "200" ]; then
  kubectl annotate node $NODE_NAME spicegarden/region/unhealthy=true
  aws route53 change-resource-record-sets --hosted-zone-id $ZONE_ID \
    --change-batch file://dr-failover.json
fi
```

### Recovery Point Objective (RPO)

- **Database**: < 5 seconds (synchronous replication)
- **Cache**: < 1 minute (async replication)
- **Files**: < 1 hour (S3 replication)

### Recovery Time Objective (RTO)

- **Automatic failover**: < 30 seconds
- **Manual intervention**: < 5 minutes

## Deployment Strategy

### Blue-Green Per Region

```yaml
# Deploy new version to all regions
# Test in APAC (primary)
# Promote EMEA → Primary if APAC healthy
# Rollback handled per-region
```

### Canary Deployment

```yaml
# Phase 1: 5% traffic in APAC
# Phase 2: 25% traffic across all regions
# Phase 3: 100% traffic
# Each phase monitored for 30 minutes
```

## Monitoring & Alerting

### Regional Health Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| `region_healthy` | 1 | Region down |
| `replication_lag_seconds` | < 5 | DR alert |
| `cross_region_latency_ms` | < 100 | Performance alert |
| `failover_events_total` | 0 | Investigate |

### Dashboard Queries

```promql
# Active users per region
sum by(region) (active_sessions)

# Request latency by region
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Regional error rate
sum by(region) (rate(http_requests_total{status=~"5.."}[5m]))
```

## Database Sharding Strategy

### User-based Sharding

```
Users A-M → APAC primary
Users N-Z → EMEA primary  
Drivers by zone → Nearest region
Orders → Any region, replicated globally
```

### Cache Warming

```bash
# On region promotion, warm cache
redis-cli --csv KEYS "user:*" | xargs redis-cli MIGRATE
```

## Configuration Files

### Environment Variables

```bash
# Per-region configuration
REGION_CODE=apac
REGION_PRIORITY=1
DATABASE_HOST=postgres-primary.apac.internal
REDIS_CLUSTER=redis-apac.internal
SYNC_TARGETS=emea,amer
```

## Testing Multi-Region

### Chaos Experiment: Region Isolation

```yaml
apiVersion: chaos-mesh.org/v2alpha1
kind: NetworkChaos
metadata:
  name: region-isolation-test
spec:
  action: partition
  direction: both
  selector:
    namespaces:
      - spicegarden-production
  partition:
    - selector:
        labelSelectors:
          region: apac
```

### Failover Testing

```bash
# Simulate APAC outage
kubectl scale deployment/backend --replicas=0 -n spicegarden-apac

# Monitor traffic shift to EMEA
kubectl logs -l app=backend -n spicegarden-emea --follow | grep "traffic increased"
```

## Cost Optimization

| Resource | Strategy |
|----------|----------|
| Compute | Scale down secondary regions (3→2 pods) |
| Database | Read replicas in secondary, async sync |
| Cache | Regional caching, no cross-region reads |
| CDN | All static assets via CloudFront |

## Security Considerations

- **GDPR**: EU data stays in EMEA region
- **PCI-DSS**: Payment data processed in PCI-compliant regions only
- **Encryption**: All cross-region traffic TLS 1.3