# SPICEGARDEN — MEMORY LIFECYCLE & LEAK DETECTION PROFILE
**Runtime:** Node.js v25.5.0 (V8 13.1.201.29) | **Profiling Tooling:** `v8.getHeapStatistics()`, Heap Snapshots  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Audit Date:** `2026-10-02T19:08:05.211Z`

---

## 1. Soak Test Memory Trajectory (60-Minute Sustained Execution)

| Time Elapsed | RSS (MB) | V8 Heap Used (MB) | V8 Heap Total (MB) | External Memory (MB) | GC Major Pauses | Leak Detected |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0 min (Idle)** | 84.2 | 42.1 | 68.5 | 4.2 | 0 | **NO** |
| **15 min (10k Load)** | 188.5 | 112.4 | 148.0 | 12.8 | 4 (avg 6.2ms) | **NO** |
| **30 min (10k Load)** | 194.2 | 118.0 | 152.4 | 13.5 | 8 (avg 7.1ms) | **NO** |
| **45 min (10k Load)** | 195.0 | 116.8 | 152.4 | 13.6 | 12 (avg 6.8ms) | **NO** |
| **60 min (10k Load)** | 194.8 | 117.2 | 152.4 | 13.5 | 16 (avg 6.9ms) | **NO** |
| **Cooldown (+10 min)**| 102.4 | 51.0 | 78.2 | 5.1 | Post-test compact | **NO** |

---

## 2. Event Listener & Handle Stability

* **Active Handles:** Rose to 418 under 10k concurrency; returned to 14 within 5 seconds of traffic cessation.
* **EventEmitter Listeners:** Zero unbounded `setMaxListeners` warnings; all Socket.IO and BullMQ event listeners cleanly removed upon socket disconnect / job completion.