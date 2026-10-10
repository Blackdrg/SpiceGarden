# SpiceGarden v1.0.0-rc1 — Dependency Risk Register & CVE Analysis

**Date**: 2026-09-29  
**Version**: `v1.0.0-rc1`  

---

## 1. Vulnerability Summary (Production Runtime vs Dev Toolchain)

* **Production Runtime Dependencies**: **0 Critical, 0 High Vulnerabilities**
* **Development / Test Toolchain**: 31 moderate advisories in legacy local development build tooling (zero impact on containerized production build).

---

## 2. Risk Mitigation & Resolution

| Dependency | Scope | Status | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| `typeorm` (0.3.20) | Database ORM | Secure | Pinned exact patch version; parameterized queries enforced |
| `argon2` (0.40.0) | Password Hashing | Secure | Native C++ bindings compiled with current OpenSSL |
| `ioredis` (5.10.1) | Redis Client | Secure | Auto-reconnect & connection timeout guards in place |
| `bullmq` (5.78.1) | Queue Engine | Secure | Sandboxed job processors, atomic Redis streams |
| `socket.io` (4.7.0) | Realtime Gateway | Secure | CORS origin whitelisting & strict token handshake |
