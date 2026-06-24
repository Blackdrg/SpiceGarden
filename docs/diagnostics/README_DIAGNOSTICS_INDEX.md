# Diagnostics Documentation Index

**Last Updated:** 2026-06-24

## Overview

This directory contains the authoritative diagnostic documentation for SpiceGarden, generated from evidence-based analysis.

## Files in This Directory

| File | Purpose | Authoritative For |
|------|---------|-------------------|
| `README_DIAGNOSTICS_INDEX.md` | This file - index of all diagnostics | Navigation |
| `REPO_INVENTORY.md` | Complete repository file/directory inventory | Counts, structure |
| `EVIDENCE_LOG.md` | Evidence for all repository claims | Verification sources |
| `STATUS_RECONCILIATION_MATRIX.md` | Reconciled conflicting claims across docs | Corrections |
| `PROJECT_AUDIT_MASTER.md` | Executive-level project assessment | High-level status |
| `BACKEND_DIAGNOSTIC.md` | Backend subsystem deep audit | Modules, services, entities |
| `CLIENTS_DIAGNOSTIC.md` | Web/mobile applications analysis | Routes, screens, features |
| `QA_AND_COVERAGE_REPORT.md` | Test suite and coverage analysis | Test counts, coverage |
| `SECURITY_AUDIT.md` | Security controls assessment | Security controls, secrets |
| `INFRA_DEPLOYMENT_AUDIT.md` | Infrastructure and deployment analysis | Docker, K8s, scripts |
| `PRODUCTION_READINESS_SCORECARD.md` | Readiness scoring across domains | Percentages, blockers |

## Evidence Sources

All diagnostics are based on:
1. Source code inspection (file counts, module structure)
2. Config file analysis (package.json, YAML files)
3. Command output (npm audit, test runs)
4. Script inspection (security-tests.js, validate-secrets.js)
5. CI/CD workflow inspection (.github/workflows/*)

## How to Refresh Diagnostics

```bash
# Run tests to update counts
cd apps/backend && npm test

# Check coverage
cd apps/backend && npm run test:cov

# Check vulnerabilities
npm audit --json

# Validate secrets (requires secrets/*.txt files)
node infra/scripts/validate-secrets.js

# Run security tests (requires running backend)
node infra/scripts/security-tests.js
```

## Stale Documentation Note

The repository contains ~100 legacy documentation files in the root and `docs/` directory. These have been flagged as potentially stale due to:
- Conflicting test counts (old: 630, actual: 911)
- Outdated coverage claims (various percentages)
- Unverified readiness percentages

The authoritative current state is documented in `docs/diagnostics/` and the root `README.md`.