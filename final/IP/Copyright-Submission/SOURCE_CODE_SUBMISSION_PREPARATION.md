# SpiceGarden v1.0.0-rc1 — Source Code Submission Preparation

**Document Name:** Source Code Submission Preparation (Deposit Extracts)  
**Release:** `v1.0.0-rc1`  
**Git Baseline Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date:** 2026-09-30  
**Status:** `READY FOR FILING`  
**Target Authority:** Copyright Office, Government of India  
**Filing Format:** Printed / Electronic PDF deposit (First 10 Pages and Last 10 Pages of Source Code)  
**Notice:** `USER ACTION REQUIRED — Print/compile with Form XIV submission`  

---

## 1. Statutory Deposit Guidelines (Indian Practice)

Under Indian Copyright Office practice for computer software registration:
1. The applicant is required to submit the **first 10 pages and last 10 pages** of the original source code.
2. If the source code contains confidential trade secrets or proprietary algorithms, the applicant may redact non-essential lines (not exceeding 50% of the deposit) while preserving identifying headers, structural organization, and key routine signatures.
3. Every page of the source code deposit must contain:
   - Header: `SpiceGarden Enterprise Software v1.0.0-rc1 | Git Commit: ca349e510d3c18a7517da7502f70ef15bd37fe77`
   - Footer: `Copyright (c) 2026 Daksh Mehta. All Rights Reserved. Confidential Source Code Deposit.`
   - Sequential page numbers (e.g., Page 1 of 20, Page 2 of 20, ..., Page 20 of 20).

---

## 2. Structure of Deposit Material (20 Pages)

### Section A: First 10 Pages (Core Architecture, Bootstrap & Data Model)
* **Pages 1–2:** Monorepo root initialization, global module orchestration (`apps/backend/src/app.module.ts`).
* **Pages 3–4:** Core application bootstrap, security middlewares, rate-limiters, helmet, and CORS filters (`apps/backend/src/main.ts`).
* **Pages 5–6:** Database entity configuration, TypeORM data models (`packages/database/src/entities/order.entity.ts`, `user.entity.ts`).
* **Pages 7–8:** Authentication service, Argon2id password hashing, JWT token lifecycle management (`apps/backend/src/modules/auth/auth.service.ts`).
* **Pages 9–10:** Order processing engine & state machine transitions (`apps/backend/src/modules/orders/orders.service.ts`).

### Section B: Last 10 Pages (Logistics, Dispatch, WebSockets & Shared Types)
* **Pages 11–12:** Driver matching, geofencing & hyper-local dispatch algorithms (`apps/backend/src/modules/delivery/dispatch.service.ts`).
* **Pages 13–14:** Dynamic surge pricing and pricing calculation engine (`apps/backend/src/modules/pricing/pricing.service.ts`).
* **Pages 15–16:** Real-time WebSocket gateway and Socket.IO connection manager (`apps/backend/src/modules/events/events.gateway.ts`).
* **Pages 17–18:** Double-entry financial ledger and payment reconciliation routines (`apps/backend/src/modules/payments/ledger.service.ts`).
* **Pages 19–20:** Shared API contracts, type definitions, and DTO interfaces (`packages/shared-types/src/index.ts`).

---

## 3. Preparation Instructions for Filing Pack

1. Generate the 20-page formatted PDF using the extracts above.
2. Bind the 20 pages with a front cover titled:
   `SOURCE CODE DEPOSIT — SPICEGARDEN v1.0.0-rc1 (LITERARY COMPUTER WORK)`
3. Attach to Form XIV and submit 3 physical copies to the Copyright Office, New Delhi.
