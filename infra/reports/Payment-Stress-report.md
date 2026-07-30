# Payment-Stress - Load Test Report

## Test Overview

- **Stage:** Payment-Stress
- **Start Time:** 2026-07-29T00:47:33.4935972+05:30
- **End Time:** 2026-07-29T00:49:34.3437475+05:30
- **Duration:** 120.8s
- **Total Metric Points:** 84,049

## HTTP Metrics

| Metric | Count | Avg | Min | P50 | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|-----|
| http_req_duration | 5586 | 72.4ms | 1.3ms | 37.4ms | 202.3ms | 268.9ms | 357.3ms | 615.7ms |
| http_req_waiting | 5586 | 72.0ms | 1.3ms | 37.1ms | 200.7ms | 267.9ms | 356.9ms | 615.7ms |
| http_req_connecting | 5586 | 0.1ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 17.8ms |
| http_req_receiving | 5586 | 0.3ms | 0.0ms | 0.0ms | 0.5ms | 0.8ms | 2.0ms | 158.7ms |
| http_req_sending | 5586 | 0.1ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 1.0ms | 126.6ms |

## Custom Metrics

| Metric | Count | Avg | Min | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|
| payment_success_rate | 5586 | 100.00% | 1 | 1 | 1 | 1 | 1 |

## Check Metrics


## Network

- **data_received:** count=5586, sum=6440658, avg=1153.00
- **data_sent:** count=5586, sum=1093935, avg=195.84
- **http_reqs:** count=5586, sum=5586, avg=1.00
- **iterations:** count=5586, sum=5586, avg=1.00
- **vus:** count=121, sum=6014, avg=49.70
- **vus_max:** count=121, sum=6050, avg=50.00
