# DNS/WAF/DDoS Configuration for SpiceGarden Production
# This document describes the production networking configuration.
# Actual WAF/DDoS rules must be configured in your cloud provider's console.

# --- DNS Configuration ---
# Zone: spicegarden.com (managed in Route 53 / Cloud DNS)
#
# Records:
#   api.spicegarden.com  -> A/AAAA -> CDN/Ingress Load Balancer
#   www.spicegarden.com  -> A/AAAA -> CDN/Ingress Load Balancer
#   spicegarden.com      -> A/AAAA -> CDN/Ingress Load Balancer
#   restaurant.spicegarden.com -> A/AAAA -> CDN/Ingress Load Balancer
#   admin.spicegarden.com      -> A/AAAA -> CDN/Ingress Load Balancer
#
# TTL: 300s for all records
# Health checks enabled on all endpoints

# --- WAF Configuration ---
# WAF rules (apply to the CDN/Ingress layer):
#
# 1. Rate Limiting:
#    - 100 requests/minute per IP for /api/*
#    - 200 requests/minute per IP for /static/*
#    - 50 requests/minute per IP for /auth/*
#
# 2. SQL Injection Protection:
#    - Block requests containing common SQL injection patterns
#    - Block requests with suspicious query parameters
#
# 3. XSS Protection:
#    - Block requests containing script injection patterns
#    - Content-Type sniffing protection enabled
#
# 4. Geo-blocking:
#    - Allow traffic from approved regions only
#    - Block known malicious IP ranges
#
# 5. Bot Protection:
#    - Challenge suspicious automated traffic
#    - Rate-limit known bot user-agents

# --- DDoS Protection ---
# 1. CDN-level protection (CloudFlare / AWS CloudFront):
#    - Automatic DDoS mitigation enabled
#    - Magic Transit for network-layer protection
#    - Rate limiting at edge
#
# 2. Application-level protection:
#    - Connection rate limiting per IP
#    - Request size limits (max 50MB)
#    - Slowloris protection (timeout 10s)
#
# 3. Monitoring:
#    - CloudWatch/Stackdriver alerts on traffic anomalies
#    - PagerDuty integration for DDoS alerts
#    - Automated scaling triggers on traffic spikes

# --- TLS Configuration ---
# - Minimum TLS version: 1.2
# - Cipher suites: ECDHE-ECDSA-AES128-GCM-SHA256, ECDHE-RSA-AES128-GCM-SHA256
# - Certificate: Let's Encrypt (auto-renewed via cert-manager)
# - HSTS: max-age=31536000; includeSubDomains; preload
# - OCSP stapling enabled

# --- CDN Configuration ---
# - Static assets cached at edge (TTL: 1 year for hashed assets)
# - HTML cached at edge (TTL: 5 minutes)
# - API responses not cached (Cache-Control: no-store)
# - Origin shield enabled for reduced origin load