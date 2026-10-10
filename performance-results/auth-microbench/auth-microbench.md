# Argon2 & Cryptographic Concurrency Limiter Microbenchmark

## Parameter Specification
- **Algorithm**: Argon2id
- **Memory Cost**: 19,456 KB (19 MB)
- **Time Cost (Iterations)**: 2
- **Parallelism**: 1 lane
- **Guidance Basis**: Current OWASP Password Storage Guidelines (Argon2id recommended profile)

## Measured Single-Operation Baselines (Hardware: 4 CPU Cores)
- **Single Hash (`argon2.hash`)**: 33.2 ms
- **Single Verify (`argon2.verify`)**: 27.8 ms
- **Combined Hash + Verify Cycle**: ~60.0 ms

## Measured Concurrency & Queue Scaling

| Concurrent Operations (N) | Total Wall Time (ms) | Average Queue Waiting Time (ms) | Measured Throughput (Ops/sec) |
| :--- | :--- | :--- | :--- |
| **1** | 60 | 0.00 | 16.67 |
| **10** | 543 | 125.60 | 18.42 |
| **50** | 2,110 | 995.64 | 23.70 |
| **100** | 3,589 | 1,722.66 | 27.86 |
| **500** | 15,121 | 7,431.74 | 33.07 |
| **1,000** | 29,091 | 14,590.87 | 34.37 |

## Architectural Findings
1. **Single Node Throughput Ceiling**: A single Node.js process on 4 CPU cores reaches a hard cryptographic ceiling of ~34.4 full hash+verify cycles per second under saturation.
2. **Semaphore Protection Effect**: The `CryptoConcurrencyLimiter` bounds active concurrent Argon2 executions to `os.availableParallelism()`. This eliminates threadpool contention, prevents event-loop starvation, and keeps event-loop delay under 32 ms.
3. **Requirement for Horizontal Multi-Replica Scaling**: To support 10,000 to 20,000 concurrent virtual users during login spikes, cluster scaling (8–14 pods) is required to distribute the aggregate cryptographic throughput (~300–500 auth ops/sec) across instances.
