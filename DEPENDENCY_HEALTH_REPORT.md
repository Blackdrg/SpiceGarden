# Dependency Health Report

Generated: 2026-06-17T11:50+05:30  
Branch: `feat/add-react-doctor`

## Executive summary

Dependency health improved materially. The workspace install graph is clean, but moderate audit findings remain.

| Check | Result |
| :--- | :--- |
| `npm install --package-lock-only` | Completed |
| `npm ls --workspaces --depth=0` | Exit `0` |
| `npm audit --json` | `0` critical, `0` high, `51` moderate |

Evidence: `reports/verification/npm-install-package-lock-only.log`, `reports/verification/npm-ls-after-p0-fixes.log`, `reports/verification/npm-audit-after-p0-fixes.json`.

## Changes

| File | Change |
| :--- | :--- |
| `apps/customer-web/package.json` | Removed unused `@rushstack/eslint-patch`. |
| `apps/restaurant-dashboard/package.json` | Removed unused `@rushstack/eslint-patch`. |
| `apps/super-admin/package.json` | Removed unused `@rushstack/eslint-patch`. |
| `package-lock.json` | Regenerated lockfile metadata after dependency cleanup. |

## Audit result

| Severity | Count |
| :--- | :---: |
| info | 0 |
| low | 0 |
| moderate | 51 |
| high | 0 |
| critical | 0 |
| total | 51 |

## Dependency graph status

`npm ls --workspaces --depth=0` completed with exit `0`. The workspace graph no longer reports the previous invalid `@sentry/node` override or other workspace-level install corruption.

## Current status

Dependency health is acceptable for continued production hardening, but not fully release-clean because `51` moderate audit findings remain. Further dependency upgrades should be done only with compatibility validation because this repo is under feature freeze.
