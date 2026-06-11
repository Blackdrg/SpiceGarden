# DNS Failover Configuration

## Failover Architecture

```
                    ┌─────────────────────┐
                    │   Primary Region    │
                    │  (AWS/Primary DC)   │
                    └─────────┬─────────┘
                              │
                    DNS: api.spicegarden.com
                    Health: /health endpoint
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Secondary Region  │
                    │  (GCP/Backup DC)    │
                    └─────────────────────┘
                              │
                    Failover: api-failover.spicegarden.com
                    Trigger: 3 consecutive failures
```

## DNS Provider Configuration

### AWS Route53 Health Checks

```bash
# Create health check
aws route53 create-health-check \
  --caller-reference $(date +%s) \
  --health-check-config '{
    "IPAddress": "PRIMARY_LOAD_BALANCER_IP",
    "Port": 443,
    "Type": "HTTPS",
    "ResourcePath": "/health",
    "FailureThreshold": 3,
    "RequestInterval": 30
  }'
```

### Cloudflare Health Checks

```bash
# Configure health checks via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/healthchecks" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "HTTPS",
    "port": 443,
    "hostname": "api.spicegarden.com",
    "path": "/health",
    "interval": 60,
    "threshold": 3,
    "timeout": 5
  }'
```

## DNS Failover TTL Settings

| Record Type | TTL | Purpose |
|-------------|-----|---------|
| A (primary) | 300s | Standard resolution |
| A (failover) | 60s | Fast failover |
| health.spicegarden.com | 10s | Health check endpoint |

## Failover Triggers

The failover mechanism triggers when:
1. Health check to `api.spicegarden.com/health` fails 3 consecutive times
2. Latency exceeds 5 seconds for 5 consecutive checks
3. Manual trigger via admin panel

## Testing Failover

```bash
# Test 1: Simulate primary failure
kubectl scale deployment/spicegarden-backend --replicas=0 -n spicegarden-production

# Wait for DNS failover (up to 60 seconds)
sleep 60

# Verify failover endpoint responds
curl https://api-failover.spicegarden.com/health

# Test 2: Restore primary
kubectl scale deployment/spicegarden-backend --replicas=3 -n spicegarden-production
```

## Failover Runbook

1. **Detection**: Monitoring alerts on `/health` endpoint failure
2. **Notification**: Alertmanager sends to Slack/PagerDuty
3. **Manual Override**: Admin can force failover via `/admin/failover` endpoint
4. **Validation**: Verify failover region health before cutover
5. **Recovery**: When primary is restored, traffic automatically shifts back

## Health Check Endpoint

The `/health` endpoint returns:
```json
{
  "status": "ok",
  "timestamp": "2026-06-10T10:30:00Z",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "mongodb": "ok"
  }
}
```

## Required DNS Records

| Record | Type | Target | TTL |
|--------|------|--------|-----|
| api.spicegarden.com | A | Primary LB IP | 300s |
| cdn.spicegarden.com | A | CDN LB IP | 300s |
| failover.spicegarden.com | A | Secondary LB IP | 60s |
| monitoring.spicegarden.com | A | Grafana LB IP | 300s |

## Environment Variables

```bash
# For failover testing
PRIMARY_REGION=us-east-1
FAILOVER_REGION=us-west-2
DNS_PROVIDER=route53
FAILOVER_ENABLED=true
HEALTH_CHECK_INTERVAL=30
FAILOVER_THRESHOLD=3
```