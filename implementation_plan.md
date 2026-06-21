# Add Comprehensive Project Data to README

## Goal Description
Rewrite and enrich the root `README.md` with data-driven, up‑to‑date information extracted from the entire SpiceGarden monorepo. This includes detailed inventory of apps, packages, backend modules, API surface, infrastructure, environment configuration, test coverage, observability, and operational guidelines. All statements will be backed by concrete evidence files in the repository.

## User Review Required
> [!IMPORTANT]
> The plan proposes adding several new sections and tables to the README. Please confirm that expanding the README is acceptable under the current **Feature Freeze** policy (only bug fixes, reliability improvements, and documentation updates are permitted). If any proposed new sections constitute a functional change, we will need explicit approval.

## Open Questions
> [!WARNING]
> 1. Should we include a generated architecture diagram (image) in the README, or keep it textual only? Generating an image would require `generate_image` tool.
> 2. Are there any sections in the README that should remain unchanged due to compliance or legal constraints?
> 3. Do you want the README to include direct links to each workspace's `README.md` (if present) for deeper navigation?

## Proposed Changes
---
### README.md Enrichments
- **Add a high‑level Architecture Overview** with a mermaid diagram summarizing services, databases, and messaging.
- **Expand the App & Package Inventory** table to include:
  - Number of source files, LOC per workspace (sourced from `loc-report.md`).
  - Primary entry points / start scripts.
- **Backend Module Catalog**: table listing each NestJS module (imported in `apps/backend/src/app.module.ts`) with purpose and source file link.
- **API Surface Summary**: concise table of major API domains (Auth, Orders, Payments, etc.) with link to `API_INVENTORY.md` and guard coverage status.
- **Infrastructure Section**: enumerate Docker Compose services, required env vars, and Kubernetes manifests (already in `infra/`). Add a table of ports.
- **Environment & Secrets**: list required `.env` variables, default values, and reference `infra/scripts/generate-secrets.ps1`.
- **Observability & Monitoring**: describe Prometheus, Grafana, OpenSearch, Alertmanager, and include links to dashboards.
- **Testing Overview**: aggregate unit, integration, e2e test counts, coverage percentages (from `CURRENT_STATUS_SUMMARY.md` and `TEST_COVERAGE_REPORT.md`).
- **Security & Reliability**: summarize audit findings, blockers, and required remediation steps.
- **Contribution Guidelines**: add quick start guide (install deps, run `docker-compose -f compose.dev.yaml up -d`, then `npm run dev`).
- **Documentation Map**: ensure all referenced docs have clickable links.
- **Add a “Known Issues & Blockers” table** extracted from `KNOWN_ISSUES_AND_BLOCKERS.md`.

### Supporting Files
- Create or update `docs/README_EVIDENCE.md` with links to all evidence sources (LOC report, API inventory, status summary, etc.).
- Optionally generate a small architecture diagram image using `generate_image` and embed it.

## Verification Plan
### Automated Checks
- Run `npm run lint` and `npm run test:all` to ensure no breakage.
- Verify that added markdown links resolve to existing files.
- Use `grep` to confirm all newly added data appears in source files.

### Manual Review
- Open the updated `README.md` in the IDE to visually confirm formatting.
- Run `docker-compose -f compose.dev.yaml up -d` (optional) to ensure infrastructure section matches running services.

---
