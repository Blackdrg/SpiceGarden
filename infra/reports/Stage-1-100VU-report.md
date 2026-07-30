# Stage-1-100VU - Load Test Report

## Test Overview

- **Stage:** Stage-1-100VU
- **Start Time:** 2026-07-29T00:31:27.1388087+05:30
- **End Time:** 2026-07-29T00:36:46.419857+05:30
- **Duration:** 319.3s
- **Total Metric Points:** 108,820

## HTTP Metrics

| Metric | Count | Avg | Min | P50 | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|-----|
| http_req_duration | 11476 | 2255.9ms | 1.5ms | 222.7ms | 10316.0ms | 13174.7ms | 18618.4ms | 32254.3ms |
| http_req_waiting | 5739 | 2239.5ms | 1.5ms | 221.3ms | 10316.0ms | 13133.0ms | 18602.4ms | 32253.8ms |
| http_req_connecting | 5739 | 0.3ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 15.7ms | 52.6ms |
| http_req_receiving | 5739 | 1.0ms | 0.0ms | 0.0ms | 1.0ms | 3.2ms | 27.2ms | 95.8ms |
| http_req_sending | 5739 | 15.0ms | 0.0ms | 0.0ms | 0.0ms | 0.6ms | 38.5ms | 2851.8ms |

## Custom Metrics

| Metric | Count | Avg | Min | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|
| http_req_success_rate | 5737 | 95.85% | 0 | 1 | 1 | 1 | 1 |
| auth_success_rate | 1725 | 97.74% | 0 | 1 | 1 | 1 | 1 |
| order_success_rate | 302 | 81.79% | 0 | 1 | 1 | 1 | 1 |
| payment_success_rate | 288 | 83.33% | 0 | 1 | 1 | 1 | 1 |
| active_vus | 11474 | 0.00 | -1 | 1 | 1 | 1 | 1 |
| errors_total | 238 | 1.00count | 1 | 1 | 1 | 1 | 1 |

## Check Metrics


## Network

- **data_received:** count=5739, sum=7859644, avg=1369.51
- **data_sent:** count=5739, sum=963644, avg=167.91
- **http_reqs:** count=5739, sum=5739, avg=1.00
- **iterations:** count=5737, sum=5737, avg=1.00
- **vus:** count=320, sum=30304, avg=94.70
- **vus_max:** count=320, sum=31857, avg=99.55
