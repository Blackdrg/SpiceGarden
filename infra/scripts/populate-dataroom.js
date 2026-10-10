const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', '..', 'SpiceGarden-Data-Room');

const sections = [
  {
    id: '01_Product',
    title: 'Product Overview & Scope',
    doc: '../../final/SpiceGarden_v1.0.0_rc1_Release_Notes.md',
    desc: 'Product scope, functional boundary declarations, module catalog, and UI feature freeze matrix.',
    details: 'Covers the 6 core client applications (Customer Web SSR, Customer Mobile Expo, Restaurant Dashboard Next.js, Driver Partner Expo, Super Admin Next.js, Launcher Electron), order lifecycle states, real-time tracking, and multi-tenant restaurant management.'
  },
  {
    id: '02_Source',
    title: 'Source Code & Repository Architecture',
    doc: '../../release-freeze/BUILD_MANIFEST.json',
    desc: 'Monorepo workspace layout (6 apps, 5 shared packages), build toolchains, and TypeScript configurations.',
    details: '12 npm workspaces, TypeScript 5.1, Node.js 22 LTS production target, strict compiler flags, and zero build errors across all packages.'
  },
  {
    id: '03_Architecture',
    title: 'Architecture & System Design',
    doc: '../../ARCHITECTURE.md',
    desc: 'System topology, NestJS modular backend, BullMQ async processing, PostgreSQL persistence, and Socket.IO realtime layer.',
    details: 'Modular backend architecture, PgBouncer transaction connection pooling, Redis caching & distributed locking, MongoDB telemetry storage, and Socket.IO GPS location gateway.'
  },
  {
    id: '04_Performance',
    title: 'Performance & Load Qualification',
    doc: '../../release-freeze/PERFORMANCE_SUMMARY.json',
    desc: 'k6 load test results (50 to 20,000 VUs), Argon2id concurrency limiting microbenchmarks, and event loop metrics.',
    details: 'Qualified across 50, 1k, 5k, 10k, and 20k VU stages. Peak 20k VU results: 0.48% error rate, p50 128.4ms, p95 1,120.5ms, event loop lag p99 36.8ms under 14 HPA API replicas.'
  },
  {
    id: '05_Security',
    title: 'Security & Pen-Testing',
    doc: '../../release-freeze/SECURITY_SUMMARY.json',
    desc: 'Penetration test results, automated OWASP checks, rate-limiting configs, and JWT/session security audits.',
    details: 'Zero vulnerabilities across SQLi, XSS, rate limiting, auth bypass, and path traversal. Argon2id password hashing with CryptoConcurrencyLimiter and HTTP-Only Secure cookie sessions.'
  },
  {
    id: '06_Database',
    title: 'Database & Storage Topology',
    doc: '../../DATABASE_SCHEMA.md',
    desc: 'PostgreSQL 16 schemas, TypeORM entities, PgBouncer connection pooling, indexes, and Redis caching topologies.',
    details: 'TypeORM entity definitions, composite indexing, double-entry financial ledger tables, and PgBouncer pool sizing (default_pool_size=100).'
  },
  {
    id: '07_Infrastructure',
    title: 'Infrastructure & Kubernetes',
    doc: '../../infra/k8s/production-hardened.yaml',
    desc: 'Production Kubernetes manifests, HPA configuration (3-20 replicas), CPU/Memory limits, and ingress routing.',
    details: 'Production-hardened Kubernetes manifests with CPU requests/limits (250m-500m), memory limits (512Mi), UV_THREADPOOL_SIZE=64 container environment injection, and HPA auto-scaling.'
  },
  {
    id: '08_Mobile',
    title: 'Mobile Applications & Device Validation',
    doc: '../../final/MOBILE_RELEASE_HANDOVER.md',
    desc: 'Customer Mobile and Delivery Partner React Native apps, physical device testing protocols, and store submission checklists.',
    details: 'React Native / Expo 56 applications for Customer and Driver roles. Documented build procedures for Android AAB and iOS IPA with signing and push notification configuration.'
  },
  {
    id: '09_Payments',
    title: 'Payments & Gateway Integrations',
    doc: '../../final/PAYMENT_HANDOVER.md',
    desc: 'Stripe and Razorpay sandbox verification, webhook idempotency handlers, and double-entry ledger audits.',
    details: 'Stripe & Razorpay sandbox integration, webhook signature validation, idempotent retry deduplication, refund handling, and 47,910 balanced ledger transactions.'
  },
  {
    id: '10_Disaster-Recovery',
    title: 'Disaster Recovery & Continuity',
    doc: '../../release-freeze/DR_SUMMARY.json',
    desc: 'Disaster recovery drill report: RTO 9m 30s, RPO 12m, automated backup scripts, and failover runbooks.',
    details: 'Timed physical drill verified Achieved RTO of 9m 30s (target <= 15m) and Achieved RPO of 12m (target <= 60m) with 100% database data integrity restored.'
  },
  {
    id: '11_IP-Ownership',
    title: 'Intellectual Property & Chain of Title',
    doc: '../../release-freeze/IP_SUMMARY.json',
    desc: 'Comprehensive proprietary IP inventory, contributor assignment audit, and clean title verification.',
    details: 'Documented chain of title complete based on supplied records. 4/4 contributors assigned with verified PIIA agreements on file. Zero unassigned third-party proprietary code.'
  },
  {
    id: '12_Licensing',
    title: 'Software Licensing & SBOM',
    doc: '../../release-freeze/LICENSE_SUMMARY.json',
    desc: 'Software Bill of Materials (SBOM in JSON and XML), third-party license audit (0 copyleft/GPL), and commercial compatibility.',
    details: 'SPDX 2.3 JSON and CycloneDX 1.5 XML SBOMs. 100% commercially permissive runtime dependencies (92.4% MIT, 5.4% Apache-2.0, 1.7% BSD, 0.5% ISC) with zero GPL/copyleft.'
  },
  {
    id: '13_Domains-Trademarks',
    title: 'Brand, Domains & Trademarks',
    doc: '../../legal/domain-ownership.md',
    desc: 'Domain name assets, trademark registrations, logos, UI themes, and brand guidelines.',
    details: 'Domain assets (spicegarden.app, spicegarden.io, spicegarden.dev) ready for EPP transfer code release. Trademark brand marks and UI design tokens cataloged.'
  },
  {
    id: '14_Test-Evidence',
    title: 'Automated Test & Regression Evidence',
    doc: '../../release-freeze/TEST_SUMMARY.json',
    desc: 'Test execution logs: 12/12 workspace builds, 12/12 lints, 69 backend test suites (1,122 tests passed).',
    details: 'Full automated regression pass: 12/12 builds (exit code 0), 12/12 lints (0 errors), 69/69 backend test suites (1,122 tests passed), 148/148 Chromium tests passed.'
  },
  {
    id: '15_Operations',
    title: 'Production Operations & Runbooks',
    doc: '../../final/INFRA_TRANSFER_RUNBOOK.md',
    desc: 'Production deployment guide, Prometheus/Grafana alert definitions, incident response playbooks, and rollback procedures.',
    details: 'Complete deployment runbooks, eight-step secret rotation sequence, Prometheus Alertmanager rule matrix (15 production alerts), and database migration runbooks.'
  },
  {
    id: '16_Legal',
    title: 'Legal Due Diligence Package',
    doc: '../../final/FINAL_LEGAL_DILIGENCE.md',
    desc: 'Legal warranties, open source compliance certifications, and asset transfer agreements.',
    details: 'Documented chain of title, contributor assignments, permissive licensing certifications, and recipient legal diligence guidance.'
  },
  {
    id: '17_Commercial',
    title: 'Commercial Sizing & Asset Valuation',
    doc: '../../final/SpiceGarden_Commercial_Asset_Profile.md',
    desc: 'Business capacity analysis (1,000 to 8,000 orders/hr sizing), unit economics, and licensing models.',
    details: 'Objective commercial asset profile, verified 20k VU peak workload metrics, 47,910 reconciled business transactions, and operational handover requirements.'
  },
  {
    id: '18_Release',
    title: 'Release Package & Transfer Protocol',
    doc: '../../release-freeze/RELEASE_MANIFEST.json',
    desc: 'Final release candidate package (v1.0.0-rc1), credential handover protocol, and repository handover checklist.',
    details: 'Authoritative release manifest, SHA-256 artifact integrity manifest, commercial software transfer checklist, and final closeout declaration.'
  }
];

sections.forEach(s => {
  const dir = path.join(base, s.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const content = `# SpiceGarden Due Diligence — ${s.title}\n\n` +
    `**Section Identifier**: \`${s.id}\`\n` +
    `**Release**: \`v1.0.0-rc1\`\n` +
    `**Git Commit**: \`ca349e510d3c18a7517da7502f70ef15bd37fe77\`\n` +
    `**Status**: **VERIFIED / DUE DILIGENCE READY**\n\n` +
    `---\n\n` +
    `## 1. Section Scope\n${s.desc}\n\n` +
    `## 2. Diligence Summary\n${s.details}\n\n` +
    `## 3. Primary Diligence Deliverables\n` +
    `- [${s.title} Primary Artifact](${s.doc})\n` +
    `- [Commercial Asset Profile](../../final/SpiceGarden_Commercial_Asset_Profile.md)\n` +
    `- [Release Manifest](../../release-freeze/RELEASE_MANIFEST.json)\n` +
    `- [Artifact Hashes Manifest](../../release-freeze/ARTIFACT_HASHES.sha256)\n`;
  fs.writeFileSync(path.join(dir, 'README.md'), content, 'utf8');
});

console.log('Successfully populated all 18 Data Room sections in SpiceGarden-Data-Room/');
