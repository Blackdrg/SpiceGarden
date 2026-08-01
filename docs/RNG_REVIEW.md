# RNG Choice Review

**Date:** 2026-08-01
**Item:** Review crypto.randomInt() usage in emergency.service.ts
**Audit Reference:** FULL_STACK_AUDIT_REPORT.md Top-5 Risk #4

## Findings

**Status: Verified-False (the flagged risk is not actually a security issue)**

### What the audit report claims
"crypto.randomInt() used for SOS incident numbering — not cryptographically secure for all use cases"
Severity: Medium. Location: `apps/backend/src/services/emergency/emergency.service.ts`

### What the code actually does

File: `apps/backend/src/services/emergency/emergency.service.ts:393-406`

```typescript
private generateIncidentNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  if (now.getTime() >= this.sosCounter.resetAt) {
    this.sosCounter.count = crypto.randomInt(0, 100);
    this.sosCounter.resetAt = now.getTime() + 60000;
  }
  this.sosCounter.count++;
  const seq = String(this.sosCounter.count).padStart(4, '0');

  return `SOS-${year}${month}-${seq}`;
}
```

### Analysis

1. **`crypto.randomInt()` IS cryptographically secure.** In Node.js, `crypto.randomInt()` uses the same CSPRNG as `crypto.randomBytes()` — the operating system's cryptographically secure random number generator (e.g., `/dev/urandom` on Linux, `CryptGenRandom` on Windows). This is the opposite of `Math.random()`, which is a non-cryptographic PRNG.

2. **The use case is incident numbering, not security.** The random value is used as a starting offset (0–100) for a sequential counter that resets every 60 seconds. The output is an incident identifier `SOS-YYYYMM-XXXX` for human tracking — not a security token, password, session ID, or secret.

3. **The prior fix was correct.** The audit report notes that `Math.random()` was replaced with `crypto.randomInt()`. This was the right call — `Math.random()` is non-cryptographic. The replacement to `crypto.randomInt()` is a strict improvement.

4. **No change needed.** For this specific use case (incident numbering), `crypto.randomInt()` is both cryptographically secure AND semantically appropriate. If anything, a CSPRNG is overkill here — even `Math.random()` would have been acceptable for a non-security identifier — but using a CSPRNG causes no harm.

### Real concurrency concern (separate from RNG choice)

The `sosCounter` is an instance variable on the `EmergencyService` class. In a multi-replica Kubernetes deployment (production-hardened.yaml specifies 3+ replicas), each replica has its own counter, leading to potential duplicate incident numbers. This is a **distributed concurrency** issue, not an RNG issue. It should be addressed via a centralized sequence generator (database-backed) or UUID-based incident IDs.

### Conclusion

The RNG choice flagged in the audit is a **false positive**. `crypto.randomInt()` is a CSPRNG and is appropriate for this use case. No code change is required for the RNG itself. The only real gap is the concurrency issue with the in-memory counter in multi-replica deployments.

**Recommendation:** No action required on the RNG. Optionally address the multi-replica counter collision in a future sprint by using database-generated sequential IDs.
