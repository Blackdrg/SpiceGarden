# SPICEGARDEN — 500K DISTRIBUTED GENERATOR CAPACITY BENCHMARK

## 1. Generator Unit Benchmarking & Safe Envelope Calibration

To ensure zero client-side distortion during 500K load generation, individual generator nodes (`c6i.2xlarge` Linux EC2 instances: 8 vCPU, 16 GiB RAM) were calibrated across concurrency levels:

```
Concur. (VUs)  Generator CPU  Memory Used  Active Sockets  Drop Rate  Safe Envelope
1,000 VUs      6.2%           0.82 GiB     ~950            0.00%      OPTIMAL
5,000 VUs      18.4%          2.15 GiB     ~4,800          0.00%      OPTIMAL
10,000 VUs     34.1%          4.20 GiB     ~9,600          0.00%      SAFE
12,500 VUs     42.5%          5.30 GiB     ~12,000         0.00%      SAFE TARGET
15,000 VUs     52.8%          6.50 GiB     ~14,400         0.00%      SAFE
20,000 VUs     71.2%          8.80 GiB     ~19,200         0.00%      NEAR MAX
25,000 VUs     88.4%          11.40 GiB    ~24,000         0.12%      SATURATION
```

---

## 2. Fleet Sizing Formula & Allocation

Based on empirical calibration:
* **Safe Capacity per Host**: `12,500 ACTIVE VUs` (maintaining CPU <45%, 0 packet drops).
* **Required Fleet Size**:
  $$\text{Generators} = \left\lceil \frac{500,000 \text{ Target VUs}}{12,500 \text{ VUs/Host}} \right\rceil = 40 \text{ Instances}$$
* **Total Generator Fleet Compute**: `40 × c6i.2xlarge` = **320 vCPUs, 640 GiB RAM, 500 Gbps aggregate network bandwidth**.

---

## 3. Fleet Aggregation & Telemetry Protocol

Each generator runs an independent k6 instance with Prometheus remote write exporting metrics tagged with `instance_id`:
* Controller aggregates: `sum(k6_vus)`, `sum(k6_reqs_per_sec)`, `weighted_avg(k6_http_req_duration)`.
* Benchmark validity requires aggregate active VUs $\ge 500,000$ across all 40 generator nodes simultaneously.
