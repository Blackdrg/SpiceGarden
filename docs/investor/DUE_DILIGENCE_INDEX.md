# Investor Due-Diligence Package — Index

**Version:** 1.0.0
**Classification:** Confidential — for qualified investors / acquirers
**Prepared:** 2026-07-17

> This index assembles existing, evidence-backed technical material. **Financial sections (forecasts, unit economics, revenue model, valuation) are BLOCKED pending Finance/Founders input and are NOT fabricated here.** See §Blocked Items.

## A. Technical (evidence-backed, in-repo)
| Doc | Location |
|-----|----------|
| Technical Summary | `docs/INVESTOR_TECHNICAL_SUMMARY.md` |
| Due-Diligence Overview | `docs/STARTUP_DUE_DILIGENCE.md` |
| Architecture | `docs/SYSTEM_ARCHITECTURE.md`, `docs/architecture/system-architecture.md` |
| Security Posture | `docs/security/security-whitepaper.md`, `SECURITY.md` |
| Production Readiness | `PRODUCTION_CERTIFICATION_REPORT.md`, `docs/PRODUCTION_READINESS_REPORT.md` |
| Test/Quality Evidence | `docs/prod-readiness/00-command-output/` |
| Reliability | `docs/RELIABILITY_TESTING.md` |
| Scaling/Load | `docs/SCALABILITY.md`, `docs/LOAD_AND_PERFORMANCE_REPORT.md` |

## B. Product & Market
- Product whitepaper → derive from `docs/BUSINESS_LOGIC.md`, `docs/ORDER_FLOW.md`, `docs/PAYMENTS.md`.
- Market analysis / competitive analysis / GTM → **BLOCKED** (requires Founders/Strategy input).
- Technical roadmap → `docs/ROADMAP.md` (engineering) + product roadmap (BLOCKED).

## C. Compliance & Legal
- Legal document index → `legal/README.md` (18 versioned docs).
- GDPR / DPDP / PCI mapping → `docs/security/security-audit-guide.md`.
- Data processing agreements, consent, DSAR → `apps/backend/src/legal/` module.

## D. BLOCKED Items (require business input — do not assume)
| Item | Owner | Why blocked |
|------|-------|--------------|
| Financial forecast (3–5 yr) | Finance/Founders | External-market assumption; not engineering data |
| Unit economics (CAC/LTV, contribution margin) | Finance | Requires real cost + revenue data |
| Revenue model final tiers | Finance | See `docs/support/pricing.md` (template) |
| Valuation | Founders/Advisors | Negotiation-sensitive |
| Market size (TAM/SAM/SOM) | Strategy | Requires market research |
| Competitive analysis | Strategy | Requires positioning data |
| Business model narrative | Founders | Qualitative, not code-derivable |

## E. How to use this pack
1. Start with `docs/STARTUP_DUE_DILIGENCE.md` (overview).
2. Engineering validation: re-run `npm run build && npm run lint && npm run test:unit && npm run test:e2e` + `infra/scripts/security-tests.js`.
3. Request the BLOCKED items from Finance/Founders before circulating financials.
