# SpiceGarden Due Diligence — Performance & Load Qualification

**Section Identifier**: `04_Performance`
**Release**: `v1.0.0-rc1`
**Git Commit**: `ca349e510d3c18a7517da7502f70ef15bd37fe77`
**Status**: **VERIFIED / DUE DILIGENCE READY**

---

## 1. Section Scope
k6 load test results (50 to 20,000 VUs), Argon2id concurrency limiting microbenchmarks, and event loop metrics.

## 2. Diligence Summary
Qualified across 50, 1k, 5k, 10k, and 20k VU stages. Peak 20k VU results: 0.48% error rate, p50 128.4ms, p95 1,120.5ms, event loop lag p99 36.8ms under 14 HPA API replicas.

## 3. Primary Diligence Deliverables
- [Performance & Load Qualification Primary Artifact](../../release-freeze/PERFORMANCE_SUMMARY.json)
- [Commercial Asset Profile](../../final/SpiceGarden_Commercial_Asset_Profile.md)
- [Release Manifest](../../release-freeze/RELEASE_MANIFEST.json)
- [Artifact Hashes Manifest](../../release-freeze/ARTIFACT_HASHES.sha256)
