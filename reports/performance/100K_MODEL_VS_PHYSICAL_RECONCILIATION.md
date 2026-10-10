# SPICEGARDEN — 100K MODEL VS PHYSICAL RECONCILIATION

**Document ID:** `AUDIT-100K-MODEL-RECON-001`  
**Classification:** `MODEL CALIBRATION & EMPIRICAL RECONCILIATION`  
**Date:** `2026-10-03T02:35:00.000Z`

---

## 1. Executive Summary & Objective

This document reconciles the previously published **Mathematical Scaling Model (50K–1M)** against the **Reported Physical Benchmark Results** and the **Audited Raw Evidence State**.

The objective is to establish why the reported physical values closely or identically match the mathematical model, and to formally delineate model validity from empirical execution.

---

## 2. Comprehensive Model vs Reported vs Audited Comparison

| Concurrency Tier | Previous Model RPS | Reported Physical RPS | Raw Evidence Found | Variance (%) | Forensic Audit Explanation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **10K VUs** | 1,380 RPS | 1,373.3 RPS | `k6-summary-10k.json` | -0.49% | **Physically Measured**: Real local execution on Windows dev host. |
| **16.85K VUs** | 2,325 RPS | 1,942.0 RPS | `k6-summary-16k.json` | -16.47% | **Physically Measured**: Real degradation under CPU & DB pool saturation. |
| **22.4K VUs** | 3,091 RPS | 2,150.0 RPS | `k6-summary-22k.json` | -30.44% | **Physically Measured**: Real ceiling hit due to `WSAENOBUFS` (10055). |
| **30K VUs** | 4,140 RPS | 4,140.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `30,000 * 0.138 RPS`. |
| **40K VUs** | 5,520 RPS | 5,520.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `40,000 * 0.138 RPS`. |
| **50K VUs** | 6,900 RPS | 6,900.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `50,000 * 0.138 RPS`. |
| **60K VUs** | 8,280 RPS | 8,280.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `60,000 * 0.138 RPS`. |
| **75K VUs** | 10,350 RPS | 10,350.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `75,000 * 0.138 RPS`. |
| **85K VUs** | 11,730 RPS | 11,730.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `85,000 * 0.138 RPS`. |
| **90K VUs** | 12,420 RPS | 12,420.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `90,000 * 0.138 RPS`. |
| **95K VUs** | 13,110 RPS | 13,110.0 RPS | Missing (Synthesized) | 0.00% | **Model Extrapolation**: Derived via equation `95,000 * 0.138 RPS`. |
| **100K VUs** | 13,200 RPS | 13,800.0 RPS | Missing (Synthesized) | +4.55% | **Model Extrapolation**: Calibrated to $138\text{ RPS}$ per 1k VUs. |

---

## 3. Subsystem Model Reconciliation

### Latency Percentiles
In the previous 100K model:
* P50: $28.0\text{ ms}$
* P90: $52.0\text{ ms}$
* P95: $68.0\text{ ms}$
* P99: $110.0\text{ ms}$

In the reported physical 100K run:
* P50: $28.0\text{ ms}$ (0.00% variance)
* P90: $52.0\text{ ms}$ (0.00% variance)
* P95: $68.0\text{ ms}$ (0.00% variance)
* P99: $110.0\text{ ms}$ (0.00% variance)

**Forensic Finding:** The reported physical latency distribution is identical to the mathematical model because the report generation script assigned the exact array constants from the model configuration object into the generated JSON and markdown outputs.

### Pod & Infrastructure Sizing
The equation for application pod sizing in both the model and the report is:
$$\text{Pods}(N) = \left\lceil \frac{N \times 0.138}{1380} \right\rceil = \left\lceil \frac{N}{10000} \right\rceil$$

For 100K VUs:
$$\text{Pods}(100000) = \frac{100000}{10000} = 10\text{ Backend Pods}$$

The model's architectural blueprint is sound, but it remains an unexecuted capacity model.
