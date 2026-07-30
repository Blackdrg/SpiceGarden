# Security-Under-Load - Load Test Report

## Test Overview

- **Stage:** Security-Under-Load
- **Start Time:** 2026-07-29T00:49:53.5306995+05:30
- **End Time:** 2026-07-29T00:51:54.5226538+05:30
- **Duration:** 121.0s
- **Total Metric Points:** 130,737

## HTTP Metrics

| Metric | Count | Avg | Min | P50 | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|-----|
| http_req_duration | 11346 | 28.5ms | 0.5ms | 10.6ms | 76.5ms | 113.4ms | 210.9ms | 557.8ms |
| http_req_waiting | 11346 | 28.3ms | 0.5ms | 10.5ms | 76.3ms | 112.4ms | 210.9ms | 557.3ms |
| http_req_connecting | 11346 | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 14.9ms |
| http_req_receiving | 11346 | 0.2ms | 0.0ms | 0.0ms | 0.5ms | 0.5ms | 1.0ms | 116.3ms |
| http_req_sending | 11346 | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 0.0ms | 1.0ms | 16.7ms |

## Custom Metrics

| Metric | Count | Avg | Min | P90 | P95 | P99 | Max |
|--------|-------|-----|-----|-----|-----|-----|-----|

## Check Metrics


## Network

- **data_received:** count=5673, sum=12898295, avg=2273.63
- **data_sent:** count=5673, sum=1286897, avg=226.85
- **http_reqs:** count=11346, sum=11346, avg=1.00
- **iterations:** count=5673, sum=5673, avg=1.00
- **vus:** count=121, sum=6007, avg=49.64
- **vus_max:** count=121, sum=6050, avg=50.00
