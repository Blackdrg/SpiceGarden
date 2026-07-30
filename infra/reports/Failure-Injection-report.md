# Failure-Injection - Load Test Report

## Test Overview

- **Stage:** Failure-Injection
- **Start Time:** 2026-07-29T00:49:53.5417705+05:30
- **End Time:** 2026-07-29T00:51:54.4826857+05:30
- **Duration:** 120.9s
- **Total Metric Points:** 89,772

## HTTP Metrics

| Metric | Count | Avg | Min | P50 | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|-----|
| http_req_duration | 5739 | 44.9ms | 0.5ms | 13.9ms | 115.6ms | 199.1ms | 419.1ms | 915.2ms |
| http_req_waiting | 5739 | 44.7ms | 0.5ms | 13.9ms | 115.6ms | 198.8ms | 418.5ms | 915.2ms |
| http_req_connecting | 5739 | 0.1ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 22.0ms |
| http_req_receiving | 5739 | 0.1ms | 0.0ms | 0.0ms | 0.5ms | 0.5ms | 1.1ms | 10.4ms |
| http_req_sending | 5739 | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 1.0ms | 7.9ms |

## Custom Metrics

| Metric | Count | Avg | Min | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|

## Check Metrics


## Network

- **data_received:** count=5739, sum=6925855, avg=1206.81
- **data_sent:** count=5739, sum=508253, avg=88.56
- **http_reqs:** count=5739, sum=5739, avg=1.00
- **iterations:** count=5739, sum=5739, avg=1.00
- **vus:** count=121, sum=6005, avg=49.63
- **vus_max:** count=121, sum=6050, avg=50.00
