# Secure Development Lifecycle (SDLC)

**Version:** 1.0.0
**Owner:** Engineering Productivity

## 1. Phases
1. **Design** — Threat model updated (`docs/security/threat-model.json`); security requirements captured.
2. **Implementation** — TypeScript strict mode; no `any` in new code; ESLint enforced (`npm run lint`).
3. **Pre-commit** — Lint + unit tests via hooks.
4. **CI (ci-cd.yml)** — `security-audit` (npm audit high + Snyk) → `build-test` (lint, unit, coverage gate, integration, e2e, build, load, Trivy) → deploy staging → deploy prod.
5. **Release** — Manual approval gate on production; smoke + HPA/CronJob verification.
6. **Operate** — Monitoring, alerting, chaos (`test:chaos`), post-mortems.

## 2. Secure Coding Standards
- Input validation via DTOs + `class-validator`.
- Parameterized queries (TypeORM); no string-concatenated SQL (verified by `security-tests.js` SQL injection suite).
- Output encoding; CSP via Helmet.
- Secrets never committed; loaded from `./secrets/` or env.
- No disabled validations, no TODO placeholders in production paths.

## 3. Verification Gates
| Gate | Tool | Blocker |
|------|------|----------|
| Lint | ESLint | Error |
| Coverage | Jest threshold 80% | Below threshold |
| SCA | npm audit + Snyk | High/critical |
| Image scan | Trivy | High/critical |
| E2E | Jest e2e | Failure |

## 4. Training
Quarterly secure-coding refresher; OWASP Top 10 review on onboarding.
