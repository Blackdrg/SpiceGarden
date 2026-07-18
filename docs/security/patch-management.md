# Patch Management Policy

**Version:** 1.0.0
**Owner:** Platform Engineering

## 1. Scope
OS packages, container base images, application dependencies (npm), and third-party services.

## 2. Cadence
| Tier | Cadence | Window |
|------|---------|--------|
| Critical / High CVEs | Immediate, within 72 h | Emergency deploy |
| Medium CVEs | Monthly | Scheduled maintenance |
| Dependency minor/patch | Bi-weekly | Standard release |
| OS / base image | Monthly | Rolling restart |

## 3. Process
1. `npm audit --audit-level=high` is gated in CI (`ci-cd.yml` → `security-audit`).
2. Snyk scan runs in the same stage; high/critical blocks the pipeline.
3. Trivy image scan blocks Docker publish.
4. Patches are applied to staging first, validated by the staging deploy job, then promoted.

## 4. Exceptions
Documented in `KNOWN_BLOCKERS_AND_GAPS.md`; temporary risk-acceptance requires Security Lead sign-off with expiry.

## 5. Verification
- `npm run lint`, `npm run build`, full test matrix must pass post-patch.
- `npm run test:chaos` (k8s fault injection) validates resilience after infra patches.
